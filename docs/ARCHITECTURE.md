# RailCloud Architecture & Systems Design

## System Overview
RailCloud is a production-grade, microservices-based, cloud-native railway ticket booking platform engineered for high-concurrency ticket reservation, resilience, and strict transactional consistency.

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|  React 19 + TypeScript + Tailwind CSS SPA (CloudFront CDN + AWS WAF + Route 53)   |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼ HTTPS
+-----------------------------------------------------------------------------------+
|                                INGRESS LAYER                                      |
|  AWS Network Load Balancer (NLB) -> NGINX Ingress Controller (Rate Limiting, TLS) |
+-----------------------------------------------------------------------------------+
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
+──────────────────+            +──────────────────+            +──────────────────+
|   Auth Service   |            |  Train Catalog   |            | Booking Service  |
|  Node.js/Express |            |  Node.js/Express |            | Node.js/Express  |
|  JWT & RBAC      |            |  Search & Stops  |            | Distributed Lock |
+──────────────────+            +──────────────────+            +──────────────────+
                                         │                                │
                                         │ Redis Cache                    │ Redis Lock
                                         ▼                                ▼
                               +───────────────────────────────────────────────────+
                               |     AWS ElastiCache Redis Cluster (Multi-AZ)      |
                               |    - Atomic SET NX EX 600 Distributed Lock        |
                               |    - High-throughput Train Catalog Search Cache   |
                               +───────────────────────────────────────────────────+
                                                                          │
                                                                          ▼ Postgres Tx
                               +───────────────────────────────────────────────────+
                               |     AWS RDS PostgreSQL (Multi-AZ Synchronous)     |
                               |    - Serializable Transactions & Strict Isolations|
                               |    - UNIQUE(seatId, travelDate) Constraint        |
                               |    - Automated WAL Archiving (30-day RPO)         |
                               +───────────────────────────────────────────────────+
                                                                          │
                                                                          ▼ Events
+──────────────────+                                            +──────────────────+
|  Payment Service |                                            |   RabbitMQ Bus   |
|  Idempotency Key | ◀───────────────────────────────────────── | Exchanges & DLX  |
|  Circuit Breaker |                                            +──────────────────+
+──────────────────+                                                      │
                                                                          ▼
                                                                +──────────────────+
                                                                |   Notification   |
                                                                |   Async Worker   |
                                                                |   Email / SMS    |
                                                                +──────────────────+

+-----------------------------------------------------------------------------------+
|                           OBSERVABILITY & SRE MESH                                |
|  Prometheus Operator -> Grafana Dashboards -> Fluent Bit -> AWS CloudWatch        |
+-----------------------------------------------------------------------------------+
```

## Concurrency Guarantee & Seat Contention Resolution
The system eliminates double-booking via a two-tier locking pattern:
1. **Tier 1 (Redis Fast Reject)**: When a passenger selects seats, `POST /api/bookings/lock-seat` executes an atomic `SET seat_lock:<train>:<date>:<seat> <token> NX EX 600`. If another user already holds the key, Redis instantly returns `null` (HTTP 409 Conflict), shedding DB load.
2. **Tier 2 (PostgreSQL Acid Ground Truth)**: During payment confirmation, a PostgreSQL transaction validates the lock token, checks seat availability, and performs an atomic insert into `booking_seats` where `UNIQUE(seatId, travelDate)` is enforced by the database engine.
