package com.quickcarrental.model;

/**
 * Enum representing the lifecycle states of a booking.
 * Transitions: CONFIRMED -> ACTIVE -> COMPLETED, or CONFIRMED -> CANCELLED.
 */
public enum BookingStatus {
    CONFIRMED,  // Booking created, waiting for pickup date
    ACTIVE,     // Customer has picked up the car, rental in progress
    COMPLETED,  // Car returned, rental finished
    CANCELLED   // Booking was cancelled (only allowed 24h+ before pickup)
}
