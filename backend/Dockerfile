# ==========================================
# Backend Dockerfile - TedBus Server
# ==========================================

# --- Stage 1: Dependency Installation ---
FROM node:22-alpine AS deps

WORKDIR /app

# Enable Corepack for pnpm support (pinned to v9 for Node 22 compatibility)
RUN corepack enable && corepack prepare pnpm@9 --activate

# Copy package management files
COPY package.json pnpm-lock.yaml* package-lock.json* ./

# Install production dependencies
RUN if [ -f pnpm-lock.yaml ]; then \
      pnpm install --prod --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
      npm ci --only=production --no-audit --no-fund; \
    else \
      npm install --omit=dev --no-audit --no-fund; \
    fi

# --- Stage 2: Runtime Image ---
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000

# Copy node_modules from deps stage
COPY --chown=node:node --from=deps /app/node_modules ./node_modules

# Copy backend source files
COPY --chown=node:node . .

# Use non-root node user for security
USER node

# Expose backend port
EXPOSE 8000

# Health check against /health endpoint
HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:${PORT:-8000}/health || exit 1

# Start Node.js application
CMD ["node", "index.js"]
