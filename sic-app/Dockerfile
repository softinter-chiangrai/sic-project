# ==========================================
# 1. Build Stage
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Build argument for GitHub Personal Access Token (for private dependencies like sic-ng)
ARG GITHUB_TOKEN

# Install git and configure GitHub credentials for private repos
RUN apk add --no-cache git openssh-client && \
    printf "machine github.com\nlogin x-access-token\npassword %s\n" "${GITHUB_TOKEN}" > /root/.netrc && \
    chmod 600 /root/.netrc && \
    git config --global url."https://github.com/".insteadOf "ssh://git@github.com/" && \
    git config --global --add url."https://github.com/".insteadOf "git@github.com:"

COPY package*.json ./
RUN npm install --legacy-peer-deps && rm -f /root/.netrc

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
