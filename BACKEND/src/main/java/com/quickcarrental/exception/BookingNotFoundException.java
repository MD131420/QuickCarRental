package com.quickcarrental.exception;

/** Thrown when a booking cannot be found by its reservation token */
public class BookingNotFoundException extends RuntimeException {

    public BookingNotFoundException(String message) {
        super(message);
    }
}
