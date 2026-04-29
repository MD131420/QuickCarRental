package com.quickcarrental.controller;

import com.quickcarrental.dto.BookingRequest;
import com.quickcarrental.dto.BookingResponse;
import com.quickcarrental.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * REST controller for booking/reservation endpoints.
 * Base path: /api/bookings
 * Handles the full booking lifecycle: create, lookup, cancel, modify, extend.
 */
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    /** POST /api/bookings — Creates a new reservation, validates dates, calculates price */
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingRequest bookingRequest) {
        BookingResponse response = bookingService.createBooking(bookingRequest);
        return ResponseEntity.status(201).body(response);
    }

    /** GET /api/bookings/{token} — Looks up a booking by its reservation token (e.g. QCR-T1A2-B3C4) */
    @GetMapping("/{token}")
    public ResponseEntity<BookingResponse> getBookingByToken(@PathVariable String token) {
        BookingResponse response = bookingService.getBookingByToken(token);
        return ResponseEntity.ok(response);
    }

    /** PATCH /api/bookings/{token}/cancel — Cancels a confirmed booking (must be 24h+ before pickup) */
    @PatchMapping("/{token}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(@PathVariable String token) {
        BookingResponse response = bookingService.cancelBooking(token);
        return ResponseEntity.ok(response);
    }

    /** PATCH /api/bookings/{token}/modify — Changes pickup and return dates of a confirmed booking */
    @PatchMapping("/{token}/modify")
    public ResponseEntity<BookingResponse> modifyBooking(@PathVariable String token, @RequestBody Map<String, String> body) {
        LocalDate pickupDate = LocalDate.parse(body.get("pickupDate"));
        LocalDate returnDate = LocalDate.parse(body.get("returnDate"));
        BookingResponse response = bookingService.modifyBooking(token, pickupDate, returnDate);
        return ResponseEntity.ok(response);
    }

    /** PATCH /api/bookings/{token}/extend — Extends the return date of an active (in-progress) booking */
    @PatchMapping("/{token}/extend")
    public ResponseEntity<BookingResponse> extendBooking(@PathVariable String token, @RequestBody Map<String, String> body) {
        LocalDate returnDate = LocalDate.parse(body.get("returnDate"));
        BookingResponse response = bookingService.extendBooking(token, returnDate);
        return ResponseEntity.ok(response);
    }

    /** GET /api/bookings — Returns all bookings (used by admin panel) */
    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        List<BookingResponse> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    /** PATCH /api/bookings/{token}/status — Admin endpoint to manually change booking status */
    @PatchMapping("/{token}/status")
    public ResponseEntity<BookingResponse> changeStatus(@PathVariable String token, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        BookingResponse response = bookingService.changeStatus(token, status);
        return ResponseEntity.ok(response);
    }
}
