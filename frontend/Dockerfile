# Stage 1: Build Angular application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors and lockfiles
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Install dependencies fast without audit/fund delays
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi

# Copy full application code
COPY . .

# Build production bundle
RUN npm run build

# Stage 2: Serve application using lightweight Nginx web server
FROM nginx:alpine AS production

# Copy custom Nginx server configuration for Angular SPA client-side routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built production assets from builder stage into Nginx web root
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

# Expose internal application port
EXPOSE 80

# Health check to ensure web server is responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/health || exit 1

# Start Nginx web server in foreground
CMD ["nginx", "-g", "daemon off;"]
