# ==========================================
# 1. Build Stage
# ==========================================
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and build package
COPY src ./src
RUN mvn clean package -DskipTests -B

# ==========================================
# 2. Runtime Stage
# ==========================================
FROM eclipse-temurin:21-jre-alpine AS runtime

ENV TZ=Asia/Bangkok
WORKDIR /app

# Copy executable jar from builder stage
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 5265

ENTRYPOINT ["java", "-Duser.timezone=Asia/Bangkok", "-jar", "app.jar"]
