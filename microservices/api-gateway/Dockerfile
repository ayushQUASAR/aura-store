# Multi-stage build for the API Gateway service
FROM maven:3-eclipse-temurin-24 AS builder
WORKDIR /workspace

# Copy Maven project files
COPY pom.xml ./
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Runtime image
FROM maven:3-eclipse-temurin-24
WORKDIR /app

# Copy the built jar
COPY --from=builder /workspace/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]

