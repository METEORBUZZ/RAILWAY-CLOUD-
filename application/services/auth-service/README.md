# Auth Service (`railway-auth`)

## Overview
Provides identity management, user registration, authentication, JWT token issuance with rotating refresh tokens, and role-based access control (RBAC) supporting `USER` and `ADMIN` roles.

## Endpoints
- `POST /api/auth/register`: Create user account
- `POST /api/auth/login`: Issue access & refresh token pair
- `POST /api/auth/refresh`: Rotate expired access token
- `POST /api/auth/logout`: Revoke active session
- `GET /api/auth/profile`: Return authenticated profile
- `GET /health`: Liveness & readiness probe
- `GET /metrics`: Prometheus metric scraping

## Security Details
- Password hashing: Bcrypt with salt rounds = 10 (or Argon2id)
- Tokens: Signed HMAC SHA-256 JWTs with 1 hour expiry
- Non-root Docker container (UID 10001) with read-only root filesystems where mounted
