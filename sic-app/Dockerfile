# ==========================================
# 1. Build Stage
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Build argument for GitHub Personal Access Token (for private dependencies like sic-ng)
ARG GITHUB_TOKEN

# Install git and configure GitHub credentials for private repos
RUN apk add --no-cache git openssh-client && \
    git config --global url."https://${GITHUB_TOKEN}@github.com/".insteadOf "ssh://git@github.com/" && \
    git config --global url."https://${GITHUB_TOKEN}@github.com/".insteadOf "git@github.com:" && \
    git config --global url."https://${GITHUB_TOKEN}@github.com/".insteadOf "https://github.com/"

# Copy package definitions and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code and build SSR application with memory optimization
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
