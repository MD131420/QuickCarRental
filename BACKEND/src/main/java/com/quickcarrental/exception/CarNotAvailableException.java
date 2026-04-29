package com.quickcarrental.exception;

/** Thrown when a car is not available — either not found, already booked, or in maintenance */
public class CarNotAvailableException extends RuntimeException {

    public CarNotAvailableException(String message) {
        super(message);
    }
}
