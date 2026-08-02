# Stage 1: Install production dependencies
FROM node:20-alpine AS dependencies

WORKDIR /app

# Copy package descriptors and lockfiles
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Install production dependencies without audit/fund delays
RUN if [ -f package-lock.json ]; then npm ci --only=production --no-audit --no-fund; else npm install --omit=dev --no-audit --no-fund; fi

# Stage 2: Minimal runtime image
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000

# Copy production node_modules from dependencies stage
COPY --chown=node:node --from=dependencies /app/node_modules ./node_modules

# Copy application files
COPY --chown=node:node . .

# Use non-root node user
USER node

# Expose application port
EXPOSE 8000

# Health check targeting the /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:${PORT:-8000}/health || exit 1

# Start the application in production mode
CMD ["npm", "run", "start:prod"]

