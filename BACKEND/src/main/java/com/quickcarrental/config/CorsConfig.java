package com.quickcarrental.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS (Cross-Origin Resource Sharing) configuration.
 * Allows the frontend (served from localhost on any port during development)
 * to make API requests to the backend.
 * In production, both frontend and backend run on the same origin (port 8080).
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    /** Configures allowed origins, HTTP methods, and headers for cross-origin requests */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("http://localhost:*", "http://127.0.0.1:*")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
