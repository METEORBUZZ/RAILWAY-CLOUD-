# Multi-Stage Production Dockerfile for Railway Auth Service
# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build || true

# Stage 2: Minimal Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

# Security: Create and use non-root system user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

ENV NODE_ENV=production
ENV PORT=4001

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /app/dist ./dist 2>/dev/null || COPY src ./src
COPY --from=builder /app/package.json ./

USER appuser

EXPOSE 4001

HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4001/health || exit 1

CMD ["node", "dist/server.js"]
