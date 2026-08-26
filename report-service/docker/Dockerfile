# ==============================
# 1️⃣ STAGE: Build Application
# ==============================
FROM eclipse-temurin:25-jdk AS builder
ENV TZ=UTC
WORKDIR /app

COPY . .
RUN apt-get update && apt-get install -y git maven
RUN mvn clean package -DskipTests

# ==============================
# 2️⃣ STAGE: Run Application
# ==============================
FROM eclipse-temurin:25-jre AS runtime
ENV TZ=UTC
WORKDIR /app

COPY --from=builder /app/target/report-service-0.0.1-SNAPSHOT.jar .

EXPOSE 80
ENTRYPOINT ["java", "-Duser.timezone=UTC", "-jar", "report-service-0.0.1-SNAPSHOT.jar", "--spring.profiles.active=production"]
