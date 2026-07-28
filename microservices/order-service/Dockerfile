# Multi-Stage Build
FROM maven:3.9.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Run JRE runtime (using cached maven image as JDK base)
FROM maven:3.9.9-eclipse-temurin-17
WORKDIR /app
COPY --from=builder /app/target/order-service-1.0.0.jar order-service.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "order-service.jar"]

