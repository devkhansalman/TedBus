# ==========================================
# Frontend Dockerfile - Angular SPA + Nginx
# ==========================================

# --- Stage 1: Build Angular Application ---
FROM node:22-alpine AS builder

WORKDIR /app

# Enable Corepack for pnpm support (pinned to v9 for compatibility)
RUN corepack enable && corepack prepare pnpm@9 --activate

# Copy package management files
COPY package.json pnpm-lock.yaml* package-lock.json* ./

# Install all dependencies required for building
RUN if [ -f pnpm-lock.yaml ]; then \
      pnpm install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
      npm ci --no-audit --no-fund; \
    else \
      npm install --no-audit --no-fund; \
    fi

# Copy full frontend application source
COPY . .

# Build production bundle
RUN if [ -f pnpm-lock.yaml ]; then pnpm run build; else npm run build; fi

# Normalize build output directory to /app/app-dist
RUN mkdir -p /app/app-dist && \
    if [ -d "dist/frontend/browser" ]; then \
      cp -r dist/frontend/browser/* /app/app-dist/; \
    elif [ -d "dist/frontend" ]; then \
      cp -r dist/frontend/* /app/app-dist/; \
    fi

# --- Stage 2: Serve application via Nginx ---
FROM nginx:alpine AS production

# Copy Nginx server configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled SPA assets from builder stage
COPY --from=builder /app/app-dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Health check targeting /health endpoint
HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/health || exit 1

# Start Nginx web server
CMD ["nginx", "-g", "daemon off;"]
