# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy monorepo root
COPY package.json package-lock.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Install dependencies
RUN npm ci

# Build shared types
RUN npm run build -w @myapp/shared

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Copy built artifacts from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api ./apps/api

# Set working directory to API
WORKDIR /app/apps/api

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start API server
EXPOSE 8080
CMD ["node", "src/index.ts"]
