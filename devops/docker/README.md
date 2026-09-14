# Docker DevOps Strategy & Guidelines

## 1. Image Tagging Strategy (Immutable SemVer + Git SHA)
Every image pushed to Docker Hub uses deterministic immutable tags:
`docker.io/<username>/<service>:<semver>-<git-short-sha>`
Example:
- `docker.io/railcloud/railway-booking:v1.4.2-a8f3b1c`
- `docker.io/railcloud/railway-auth:v1.4.2-a8f3b1c`

We **NEVER** deploy to production using the mutable `:latest` tag.

## 2. Multi-Stage Build Strategy
All microservice Dockerfiles follow a 2-stage build:
- **Stage 1 (`builder`)**: Node.js Alpine base, compiles TypeScript, prunes dev dependencies.
- **Stage 2 (`runner`)**: Minimal Alpine base, copies only production artifacts, creates dedicated non-root UID/GID `10001` (`appuser`).

## 3. Local Development Orchestration
Run the complete stack with:
```bash
docker compose -f devops/docker/docker-compose.yml up -d --build
```
Verify health endpoints:
```bash
curl http://localhost:4001/health # auth
curl http://localhost:4002/health # train
curl http://localhost:4003/health # booking
curl http://localhost:4004/health # payment
curl http://localhost:4005/health # notification
```
