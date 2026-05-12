# Stage 1: Compilazione
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Stage 2: Esecuzione
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Esposizione porta
EXPOSE 8080

# Avvio forzando il profilo 'prod'
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]