package com.quickcarrental.repository;

import com.quickcarrental.model.Booking;
import com.quickcarrental.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for Booking entities.
 * Provides methods for token-based lookup, availability checking (date overlap detection),
 * and statistical queries for the admin dashboard.
 */
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    /** Look up a booking by its unique reservation token (e.g. QCR-T1A2-B3C4) */
    Optional<Booking> findByReservationToken(String reservationToken);

    /** Find all bookings for a specific car with given statuses — used for date overlap checking */
    List<Booking> findByCarIdAndStatusIn(Long carId, List<BookingStatus> statuses);

    /** Find all bookings with a specific status (e.g. all ACTIVE bookings for revenue calculation) */
    List<Booking> findByStatus(BookingStatus status);

    /** Count bookings by status — used for dashboard statistics */
    long countByStatus(BookingStatus status);

    /** Groups bookings by creation date since a given timestamp — used for the admin chart */
    @Query("SELECT CAST(b.createdAt AS DATE) AS bookingDate, COUNT(b) AS bookingCount " +
           "FROM Booking b " +
           "WHERE b.createdAt >= :since " +
           "GROUP BY CAST(b.createdAt AS DATE) " +
           "ORDER BY CAST(b.createdAt AS DATE)")
    List<Object[]> findBookingsGroupedByDateSince(@org.springframework.data.repository.query.Param("since") java.time.LocalDateTime since);
}
