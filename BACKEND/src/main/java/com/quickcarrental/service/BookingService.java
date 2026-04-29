package com.quickcarrental.service;

import com.quickcarrental.dto.BookingRequest;
import com.quickcarrental.dto.BookingResponse;
import com.quickcarrental.exception.BookingNotFoundException;
import com.quickcarrental.exception.CarNotAvailableException;
import com.quickcarrental.model.Booking;
import com.quickcarrental.model.BookingStatus;
import com.quickcarrental.model.Car;
import com.quickcarrental.repository.BookingRepository;
import com.quickcarrental.repository.CarRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * Core business logic service for all booking operations.
 * Handles reservation creation (with date overlap validation and price calculation),
 * cancellation (with 24h policy), date modification, rental extension, and admin statistics.
 */
@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final TokenService tokenService;

    // Constructor injection of all required dependencies
    public BookingService(BookingRepository bookingRepository, CarRepository carRepository, TokenService tokenService) {
        this.bookingRepository = bookingRepository;
        this.carRepository = carRepository;
        this.tokenService = tokenService;
    }

    /**
     * Creates a new booking: validates car availability, checks for date overlaps
     * with existing bookings, calculates total price (base + extras), generates
     * a unique reservation token, and saves to database.
     */
    public BookingResponse createBooking(BookingRequest request) {
        Car car = carRepository.findById(request.getCarId())
                .orElseThrow(() -> new CarNotAvailableException("Car not found with id: " + request.getCarId()));

        if (!"available".equalsIgnoreCase(car.getStatus())) {
            throw new CarNotAvailableException("Car is not available for booking");
        }

        // Check date overlap with existing CONFIRMED/ACTIVE bookings
        List<BookingStatus> activeStatuses = List.of(BookingStatus.CONFIRMED, BookingStatus.ACTIVE);
        List<Booking> existingBookings = bookingRepository.findByCarIdAndStatusIn(request.getCarId(), activeStatuses);

        for (Booking existing : existingBookings) {
            if (datesOverlap(request.getPickupDate(), request.getReturnDate(),
                    existing.getPickupDate(), existing.getReturnDate())) {
                throw new CarNotAvailableException("Car is already booked for the selected dates");
            }
        }

        long days = ChronoUnit.DAYS.between(request.getPickupDate(), request.getReturnDate());
        if (days <= 0) {
            throw new CarNotAvailableException("Return date must be after pickup date");
        }

        BigDecimal totalPrice = calculatePrice(car.getPricePerDay(), days, request);

        Booking booking = new Booking();
        booking.setReservationToken(tokenService.generateToken());
        booking.setCarId(request.getCarId());
        booking.setCustomerName(request.getCustomerName());
        booking.setCustomerEmail(request.getCustomerEmail());
        booking.setCustomerPhone(request.getCustomerPhone());
        booking.setPickupDate(request.getPickupDate());
        booking.setReturnDate(request.getReturnDate());
        booking.setPickupLocation(request.getPickupLocation());
        booking.setReturnLocation(request.getReturnLocation());
        booking.setExtrasGPS(request.isExtrasGPS());
        booking.setExtrasChildSeat(request.isExtrasChildSeat());
        booking.setExtrasExtraDriver(request.isExtrasExtraDriver());
        booking.setExtrasInsurance(request.isExtrasInsurance());
        booking.setExtrasFuelPrepay(request.isExtrasFuelPrepay());
        booking.setNotes(request.getNotes());
        booking.setTotalPrice(totalPrice);
        booking.setStatus(BookingStatus.CONFIRMED);

        Booking saved = bookingRepository.save(booking);
        return toResponse(saved, car);
    }

    public BookingResponse getBookingByToken(String token) {
        Booking booking = bookingRepository.findByReservationToken(token)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with token: " + token));
        return toResponse(booking);
    }

    /** Cancels a booking — only allowed for CONFIRMED status and 24+ hours before pickup */
    public BookingResponse cancelBooking(String token) {
        Booking booking = findByToken(token);

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new CarNotAvailableException("Only confirmed bookings can be cancelled");
        }

        LocalDateTime pickupDateTime = booking.getPickupDate().atStartOfDay();
        if (pickupDateTime.isBefore(LocalDateTime.now().plusHours(24))) {
            throw new CarNotAvailableException("Cannot cancel booking less than 24 hours before pickup");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return toResponse(bookingRepository.save(booking));
    }

    /** Modifies pickup/return dates — checks for overlaps with other bookings, recalculates price */
    public BookingResponse modifyBooking(String token, LocalDate newPickup, LocalDate newReturn) {
        Booking booking = findByToken(token);

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new CarNotAvailableException("Only confirmed bookings can be modified");
        }

        List<BookingStatus> activeStatuses = List.of(BookingStatus.CONFIRMED, BookingStatus.ACTIVE);
        List<Booking> existingBookings = bookingRepository.findByCarIdAndStatusIn(booking.getCarId(), activeStatuses);

        for (Booking existing : existingBookings) {
            if (!existing.getId().equals(booking.getId()) &&
                    datesOverlap(newPickup, newReturn, existing.getPickupDate(), existing.getReturnDate())) {
                throw new CarNotAvailableException("Car is already booked for the selected dates");
            }
        }

        long days = ChronoUnit.DAYS.between(newPickup, newReturn);
        if (days <= 0) {
            throw new CarNotAvailableException("Return date must be after pickup date");
        }

        Car car = carRepository.findById(booking.getCarId())
                .orElseThrow(() -> new CarNotAvailableException("Car not found"));

        BigDecimal totalPrice = calculatePriceFromBooking(car.getPricePerDay(), days, booking);

        booking.setPickupDate(newPickup);
        booking.setReturnDate(newReturn);
        booking.setTotalPrice(totalPrice);

        return toResponse(bookingRepository.save(booking), car);
    }

    /** Extends rental return date — only for ACTIVE bookings, checks date availability */
    public BookingResponse extendBooking(String token, LocalDate newReturn) {
        Booking booking = findByToken(token);

        if (booking.getStatus() != BookingStatus.ACTIVE) {
            throw new CarNotAvailableException("Only active bookings can be extended");
        }

        List<BookingStatus> activeStatuses = List.of(BookingStatus.CONFIRMED, BookingStatus.ACTIVE);
        List<Booking> existingBookings = bookingRepository.findByCarIdAndStatusIn(booking.getCarId(), activeStatuses);

        for (Booking existing : existingBookings) {
            if (!existing.getId().equals(booking.getId()) &&
                    datesOverlap(booking.getPickupDate(), newReturn, existing.getPickupDate(), existing.getReturnDate())) {
                throw new CarNotAvailableException("Car is already booked for the extended dates");
            }
        }

        long days = ChronoUnit.DAYS.between(booking.getPickupDate(), newReturn);
        Car car = carRepository.findById(booking.getCarId())
                .orElseThrow(() -> new CarNotAvailableException("Car not found"));

        BigDecimal totalPrice = calculatePriceFromBooking(car.getPricePerDay(), days, booking);

        booking.setReturnDate(newReturn);
        booking.setTotalPrice(totalPrice);

        return toResponse(bookingRepository.save(booking), car);
    }

    public List<BookingResponse> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();
        List<BookingResponse> responses = new ArrayList<>();
        for (Booking b : bookings) {
            responses.add(toResponse(b));
        }
        return responses;
    }

    public BookingResponse changeStatus(String token, String statusStr) {
        Booking booking = findByToken(token);
        BookingStatus newStatus = BookingStatus.valueOf(statusStr.toUpperCase());
        booking.setStatus(newStatus);
        return toResponse(bookingRepository.save(booking));
    }

    /** Computes admin dashboard stats: total cars, active bookings, revenue, last 7 days chart data */
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();

        stats.put("totalCars", carRepository.count());
        stats.put("activeBookings", bookingRepository.countByStatus(BookingStatus.ACTIVE));
        stats.put("availableCars", carRepository.findByStatus("available").size());

        List<Booking> activeBookings = bookingRepository.findByStatus(BookingStatus.ACTIVE);
        BigDecimal dailyRevenue = BigDecimal.ZERO;
        for (Booking b : activeBookings) {
            long days = ChronoUnit.DAYS.between(b.getPickupDate(), b.getReturnDate());
            if (days > 0) {
                dailyRevenue = dailyRevenue.add(b.getTotalPrice().divide(BigDecimal.valueOf(days), 2, RoundingMode.HALF_UP));
            }
        }
        stats.put("dailyRevenue", dailyRevenue);

        // Last 7 days data as a map of date -> count (computed in Java)
        Map<String, Long> last7DaysData = new LinkedHashMap<>();
        for (int i = 6; i >= 0; i--) {
            last7DaysData.put(LocalDate.now().minusDays(i).toString(), 0L);
        }
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        List<Booking> allBookings = bookingRepository.findAll();
        for (Booking b : allBookings) {
            if (b.getCreatedAt() != null && b.getCreatedAt().isAfter(sevenDaysAgo)) {
                String dateKey = b.getCreatedAt().toLocalDate().toString();
                last7DaysData.computeIfPresent(dateKey, (k, v) -> v + 1);
            }
        }
        stats.put("last7DaysData", last7DaysData);

        return stats;
    }

    // --- Private helpers ---

    /** Finds a booking by token or throws BookingNotFoundException */
    private Booking findByToken(String token) {
        return bookingRepository.findByReservationToken(token)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with token: " + token));
    }

    private BookingResponse toResponse(Booking booking) {
        Car car = carRepository.findById(booking.getCarId()).orElse(null);
        return toResponse(booking, car);
    }

    private BookingResponse toResponse(Booking booking, Car car) {
        BookingResponse response = BookingResponse.fromBooking(booking);
        if (car != null) {
            response.setCarBrand(car.getBrand());
            response.setCarModel(car.getModel());
            response.setCarImageUrl(car.getImageUrl());
            response.setCarCategory(car.getCategory() != null ? car.getCategory().name() : null);
            response.setCarLicensePlate(car.getLicensePlate());
            response.setCarPricePerDay(car.getPricePerDay());
        }
        return response;
    }

    /** Checks if two date ranges overlap (used to prevent double-booking a car) */
    private boolean datesOverlap(LocalDate start1, LocalDate end1, LocalDate start2, LocalDate end2) {
        return !start1.isAfter(end2.minusDays(1)) && !end1.isBefore(start2.plusDays(1));
    }

    /** Calculates total price: (daily rate + extras per day) * days + one-time fees (fuel prepay) */
    private BigDecimal calculatePrice(BigDecimal pricePerDay, long days, BookingRequest request) {
        BigDecimal total = pricePerDay.multiply(BigDecimal.valueOf(days));

        if (request.isExtrasGPS()) {
            total = total.add(BigDecimal.valueOf(5).multiply(BigDecimal.valueOf(days)));
        }
        if (request.isExtrasChildSeat()) {
            total = total.add(BigDecimal.valueOf(3).multiply(BigDecimal.valueOf(days)));
        }
        if (request.isExtrasExtraDriver()) {
            total = total.add(BigDecimal.valueOf(10).multiply(BigDecimal.valueOf(days)));
        }
        if (request.isExtrasInsurance()) {
            total = total.add(BigDecimal.valueOf(15).multiply(BigDecimal.valueOf(days)));
        }
        if (request.isExtrasFuelPrepay()) {
            total = total.add(BigDecimal.valueOf(40));
        }

        return total;
    }

    private BigDecimal calculatePriceFromBooking(BigDecimal pricePerDay, long days, Booking booking) {
        BigDecimal total = pricePerDay.multiply(BigDecimal.valueOf(days));

        if (Boolean.TRUE.equals(booking.getExtrasGPS())) {
            total = total.add(BigDecimal.valueOf(5).multiply(BigDecimal.valueOf(days)));
        }
        if (Boolean.TRUE.equals(booking.getExtrasChildSeat())) {
            total = total.add(BigDecimal.valueOf(3).multiply(BigDecimal.valueOf(days)));
        }
        if (Boolean.TRUE.equals(booking.getExtrasExtraDriver())) {
            total = total.add(BigDecimal.valueOf(10).multiply(BigDecimal.valueOf(days)));
        }
        if (Boolean.TRUE.equals(booking.getExtrasInsurance())) {
            total = total.add(BigDecimal.valueOf(15).multiply(BigDecimal.valueOf(days)));
        }
        if (Boolean.TRUE.equals(booking.getExtrasFuelPrepay())) {
            total = total.add(BigDecimal.valueOf(40));
        }

        return total;
    }
}
