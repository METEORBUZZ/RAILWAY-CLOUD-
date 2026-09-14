# Verification of 10 Real Production Scenarios

This document details how each production scenario is implemented, configured, and verified.

---

### Scenario 1: Zero-Downtime Deployment
- **Mechanism**: Kubernetes `RollingUpdate` with `maxSurge: 25%` and `maxUnavailable: 0`.
- **Implementation**:
  Readiness probes ensure newly spawned V2 pods are only registered into service endpoints after the application returns HTTP 200 on `/health`. Old V1 pods are only terminated after V2 pods are 100% ready.
- **Verification Command**:
  ```bash
  kubectl rollout status deployment/booking-service -n railcloud
  ```

---

### Scenario 2: Automatic Rollback
- **Mechanism**: Jenkins Pipeline Quality Gate + Argo CD Automated Health Assessment + Kubernetes Deployment Rollback.
- **Implementation**:
  If a newly deployed image fails its readiness probe or crashes, Kubernetes halts rollout progression.
- **Verification Command**:
  ```bash
  # Manual or automated trigger
  kubectl rollout undo deployment/booking-service -n railcloud
  ```

---

### Scenario 3: Concurrent Seat Booking Protection
- **Mechanism**: Redis distributed lock (`SET NX EX 600`) + PostgreSQL `UNIQUE("seatId", "travelDate")` constraint.
- **Verification Command**:
  ```bash
  npx tsx tests/concurrency-seat-test.ts
  ```
  Launches 10 parallel threads hammering the exact same seat. Verifies exactly 1 lock acquisition and 9 conflicts.

---

### Scenario 4: Kubernetes Auto Scaling (HPA)
- **Mechanism**: `HorizontalPodAutoscaler` v2 scaling `booking-service` from 2 pods up to 10 pods when CPU utilization exceeds 70%.
- **Verification Command**:
  ```bash
  k6 run tests/k6-load-test.js
  kubectl get hpa booking-service-hpa -n railcloud --watch
  ```

---

### Scenario 5: Pod Self-Healing
- **Mechanism**: Kubernetes `kubelet` process monitor + Liveness probes.
- **Verification Command**:
  ```bash
  POD=$(kubectl get pods -n railcloud -l app=booking-service -o jsonpath='{.items[0].metadata.name}')
  kubectl delete pod $POD -n railcloud
  kubectl get pods -n railcloud -l app=booking-service --watch
  ```
  The Deployment Controller immediately detects replica deficit and schedules a replacement pod within 2 seconds.

---

### Scenario 6: Security Gate Failure (Pipeline Halt)
- **Mechanism**: Trivy container vulnerability scanner + SonarQube quality gate in `devops/jenkins/Jenkinsfile`.
- **Behavior**:
  If any `CRITICAL` vulnerability or security flaw is detected, Trivy exits with code 1 (`--exit-code 1`), immediately stopping the build and aborting the Docker Hub push.

---

### Scenario 7: Database Backup & Point-in-Time Recovery
- **Mechanism**: AWS RDS automated WAL archive with 30-day retention and S3 KMS-encrypted snapshots.
- **Verification**: Runbook documented in `devops/disaster-recovery/runbooks/rto-rpo-strategy.md`.

---

### Scenario 8: Centralized Monitoring & Alerting
- **Mechanism**: Prometheus scraping `/metrics` on every microservice; Grafana dashboards with metrics for RPS, Latency p99, Error Rate, and Seat Lock contention.

---

### Scenario 9: Distributed Tracing & Idempotency
- **Mechanism**: OpenTelemetry trace context propagation across HTTP headers (`x-correlation-id`, `traceparent`). Idempotency keys (`Idempotency-Key` header) prevent duplicate payment and duplicate bookings.

---

### Scenario 10: Disaster Recovery Drill (RTO < 15m, RPO < 5m)
- **Mechanism**: Multi-AZ automated RDS failover, etcd snapshot restoration from S3, and GitOps self-healing state re-synchronization via Argo CD.
