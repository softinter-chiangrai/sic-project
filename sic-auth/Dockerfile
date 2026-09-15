# ============================================================================
# Stage 1: Build Keycloakify Theme (Angular)
# ============================================================================
FROM node:24-bookworm-slim AS theme-builder

# Install OpenJDK & Maven for Keycloakify JAR packaging
RUN apt-get update && apt-get install -y --no-install-recommends \
    maven \
    default-jre-headless \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Copy dependency definitions and local package tarballs
COPY sic-keycloak-theme/package*.json ./
COPY sic-keycloak-theme/sic-ng-*.tgz ./

RUN npm install

# Copy the rest of the theme source files
COPY sic-keycloak-theme/ ./

# Build Angular + Keycloakify JAR
RUN npm run build-keycloak-theme

# ============================================================================
# Stage 2: Keycloak Runtime
# ============================================================================
FROM quay.io/keycloak/keycloak:latest

# Copy built theme JAR directly into Keycloak providers
COPY --from=theme-builder /build/dist_keycloak/keycloak-theme-for-kc-all-other-versions.jar /opt/keycloak/providers/sic-ng-login-theme.jar
