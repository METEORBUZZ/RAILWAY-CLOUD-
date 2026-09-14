FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build || true

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
ENV NODE_ENV=production
ENV PORT=4002

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --from=builder /app/dist ./dist 2>/dev/null || COPY src ./src
COPY --from=builder /app/package.json ./

USER appuser
EXPOSE 4002
HEALTHCHECK --interval=15s --timeout=3s CMD wget --no-verbose --spider http://localhost:4002/health || exit 1
CMD ["node", "dist/server.js"]
