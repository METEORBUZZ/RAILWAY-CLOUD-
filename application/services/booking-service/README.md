# Booking Microservice (`railway-booking`)

## Concurrency Architecture (Mission Critical)
Two concurrent users must **NEVER** successfully book the same seat.
This service enforces a multi-layer defense:

```
User Request
    ↓
POST /api/bookings/lock-seat
    ↓
Redis Distributed Lock (SET seat_lock:<train>:<date>:<seat> <token> NX EX 600)
    ↓ (If 409, reject immediately)
PostgreSQL Transaction Isolation (SERIALIZABLE / REPEATABLE READ)
    ↓
Seat Availability & Idempotency Key Validation
    ↓
PostgreSQL INSERT INTO booking_seats (UNIQUE constraint: seatId + travelDate)
    ↓
Release Redis Lock & Commit Transaction
    ↓
Publish BOOKING_CREATED & BOOKING_CONFIRMED to RabbitMQ Exchange
```

## Endpoints
- `POST /api/bookings/lock-seat`: Acquire 10-minute Redis lock
- `POST /api/bookings`: Create confirmed booking within database transaction
- `GET /api/bookings/:id`: Retrieve booking by ID or 10-digit PNR
- `GET /api/bookings/user/:userId`: Retrieve user bookings
- `POST /api/bookings/:id/cancel`: Cancel booking, release seats & compute refund
- `POST /api/bookings/simulate-concurrency`: Stress test concurrency collision with parallel threads
- `GET /api/bookings/events`: RabbitMQ event inspection feed
