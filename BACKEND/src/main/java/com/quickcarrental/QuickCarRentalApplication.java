package com.quickcarrental;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the QuickCarRental Spring Boot application.
 * This class bootstraps the embedded Tomcat server, initializes the Spring context,
 * and auto-configures components (JPA, H2 database, REST controllers, etc.).
 */
@SpringBootApplication
public class QuickCarRentalApplication {

    public static void main(String[] args) {
        // Launches the application on port 8080 (configured in application.properties)
        SpringApplication.run(QuickCarRentalApplication.class, args);
    }
}
