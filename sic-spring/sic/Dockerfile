FROM eclipse-temurin:21-jre-alpine AS runtime

ENV TZ=Asia/Bangkok
WORKDIR /app

# Copy executable jar
COPY target/*.jar app.jar

EXPOSE 5265

ENTRYPOINT ["java", "-Duser.timezone=Asia/Bangkok", "-jar", "app.jar"]
