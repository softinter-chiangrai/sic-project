# ==========================================
# 1. Build Stage
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install git for GitHub packages (e.g. sic-ng)
RUN apk add --no-cache git

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy source code and build SSR application
COPY . .
RUN npm run build

# ==========================================
# 2. Runtime Stage (SSR Node Server)
# ==========================================
FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4200

# Copy built application and runtime dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 4200

CMD ["node", "dist/sic-app/server/server.mjs"]
