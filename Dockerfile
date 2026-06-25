# ── Stage 1: Builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy all source files
COPY . .

# Build the Vite/React app — outputs to /app/dist by default
# VITE_ prefixed env vars are embedded at build time.
# We pass the API Gateway URL as a build arg so the built JS knows where to call.
ARG VITE_API_BASE_URL=https://api.yourdomain.com
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ── Stage 2: Final (Nginx) ────────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copy built static files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]