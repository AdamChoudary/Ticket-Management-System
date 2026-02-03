# ============================================================================
# Multi-stage Dockerfile for Next.js Frontend
# ============================================================================

# Stage 1: Dependencies
FROM node:20-alpine AS dependencies

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# ============================================================================
# Stage 2: Development
# ============================================================================
FROM node:20-alpine AS development

WORKDIR /app

# Copy node_modules from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Development command (with hot reload)
CMD ["npm", "run", "dev"]

# ============================================================================
# Stage 3: Builder
# ============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application code
COPY . .

# Build application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ============================================================================
# Stage 4: Production
# ============================================================================
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Production command
CMD ["node", "server.js"]
