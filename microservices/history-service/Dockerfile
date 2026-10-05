# Multi-Stage Build
FROM maven:3-eclipse-temurin-24 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime image
FROM maven:3-eclipse-temurin-24
WORKDIR /app
COPY --from=builder /app/target/history-service-1.0.0.jar history-service.jar
EXPOSE 8084
ENTRYPOINT ["java", "-jar", "history-service.jar"]
