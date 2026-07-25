# ═══════════════════════════════════════════════════
# Stage 1: Build — compile TypeScript
# ═══════════════════════════════════════════════════
FROM node:22-alpine AS builder

WORKDIR /app

# Install all dependencies (including devDependencies for tsc)
COPY package.json package-lock.json* ./
RUN npm ci

# Generate Prisma client (needed for TypeScript type-checking)
COPY prisma/ ./prisma/
RUN npx prisma generate

# Copy source and compile
COPY tsconfig.json tsconfig.build.json ./
COPY src/ ./src/
RUN npm run build

# ═══════════════════════════════════════════════════
# Stage 2: Production — minimal runtime image
# ═══════════════════════════════════════════════════
FROM node:22-alpine AS production

WORKDIR /app

# Prisma engines need OpenSSL on Alpine
RUN apk add --no-cache openssl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Install production dependencies only
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Copy compiled output from builder
COPY --from=builder /app/dist/ ./dist/

# Copy Prisma schema + migrations for runtime (migrate deploy)
COPY prisma/ ./prisma/

# Generate Prisma client for production
RUN npx prisma generate

# Give nodejs user ownership so prisma migrate can write to node_modules/.prisma
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

EXPOSE 6300

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:6300/health').then(r => r.json()).then(d => { if (d.status !== 'healthy') process.exit(1) })"

CMD ["node", "dist/server.js"]
