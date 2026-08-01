# Stage 1: Build Angular application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and optional package-lock.json
COPY package.json package-lock.json* ./

# Install dependencies fast without audit/fund delays
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi

# Copy full application code
COPY . .

# Build production bundle
RUN npm run build

# Stage 2: Serve application using Node.js static server
FROM node:20-alpine AS production

WORKDIR /app

# Install lightweight Node static server with SPA support
RUN npm install -g serve --no-audit --no-fund

# Copy built production assets with non-root ownership
COPY --chown=node:node --from=builder /app/dist/frontend/browser ./dist

# Use non-root node user
USER node

# Expose internal application port
EXPOSE 4200

# Health check to ensure web server is responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4200/ || exit 1

# Start static file server with SPA routing fallback
CMD ["serve", "-s", "dist", "-l", "4200"]
