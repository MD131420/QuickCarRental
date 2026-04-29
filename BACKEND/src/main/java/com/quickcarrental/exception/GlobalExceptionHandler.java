package com.quickcarrental.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Centralized exception handler for the entire REST API.
 * Catches specific exceptions thrown by services and converts them
 * into structured JSON error responses with appropriate HTTP status codes.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** Handles booking not found — returns 404 with error message */
    @ExceptionHandler(BookingNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleBookingNotFound(BookingNotFoundException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", ex.getMessage());
        body.put("code", 404);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    /** Handles car not available / booking conflict — returns 409 Conflict */
    @ExceptionHandler(CarNotAvailableException.class)
    public ResponseEntity<Map<String, Object>> handleCarNotAvailable(CarNotAvailableException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", ex.getMessage());
        body.put("code", 409);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    /** Handles validation errors (e.g. missing required fields) — returns 400 with field-level messages */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .reduce((a, b) -> a + "; " + b)
                .orElse("Validation failed");

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", message);
        body.put("code", 400);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }
}
