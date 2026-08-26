# .devcontainer/Dockerfile

# Base Image
FROM eclipse-temurin:25-jdk

# Interactive Mode
ENV DEBIAN_FRONTEND=noninteractive

# Install Dependencies
RUN apt-get update -y && apt-get upgrade -y
RUN apt-get install -y --no-install-recommends curl git maven 

# Clean Up
RUN apt-get clean -y
RUN rm -rf /var/lib/apt/lists/*