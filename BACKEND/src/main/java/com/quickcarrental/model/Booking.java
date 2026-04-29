package com.quickcarrental.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * JPA entity representing a car rental booking / reservation.
 * Maps to the "bookings" table in the H2 database.
 * Stores customer info, rental dates, selected extras, total price, and booking status.
 * Each booking is identified by a unique reservation token (e.g. QCR-T1A2-B3C4).
 */
@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Unique token used by customers to look up their booking (e.g. QCR-XXXX-XXXX)
    @Column(name = "reservation_token", unique = true, nullable = false)
    private String reservationToken;

    @Column(name = "car_id", nullable = false)
    private Long carId;

    @NotBlank
    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @NotBlank
    @Email
    @Column(name = "customer_email", nullable = false)
    private String customerEmail;

    @Column(name = "customer_phone")
    private String customerPhone;

    @NotNull
    @Column(name = "pickup_date", nullable = false)
    private LocalDate pickupDate;

    @NotNull
    @Column(name = "return_date", nullable = false)
    private LocalDate returnDate;

    @Column(name = "pickup_location")
    private String pickupLocation;

    @Column(name = "return_location")
    private String returnLocation;

    @Column(name = "extras_gps")
    private Boolean extrasGPS;

    @Column(name = "extras_child_seat")
    private Boolean extrasChildSeat;

    @Column(name = "extras_extra_driver")
    private Boolean extrasExtraDriver;

    @Column(name = "extras_insurance")
    private Boolean extrasInsurance;

    @Column(name = "extras_fuel_prepay")
    private Boolean extrasFuelPrepay;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "total_price", nullable = false)
    private BigDecimal totalPrice;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BookingStatus status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Booking() {
    }

    /** JPA callback — automatically sets timestamps when a new booking is created */
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
    }

    /** JPA callback — automatically updates the updatedAt timestamp on every modification */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getReservationToken() { return reservationToken; }
    public void setReservationToken(String reservationToken) { this.reservationToken = reservationToken; }

    public Long getCarId() { return carId; }
    public void setCarId(Long carId) { this.carId = carId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public LocalDate getPickupDate() { return pickupDate; }
    public void setPickupDate(LocalDate pickupDate) { this.pickupDate = pickupDate; }

    public LocalDate getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDate returnDate) { this.returnDate = returnDate; }

    public String getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; }

    public String getReturnLocation() { return returnLocation; }
    public void setReturnLocation(String returnLocation) { this.returnLocation = returnLocation; }

    public Boolean getExtrasGPS() { return extrasGPS; }
    public void setExtrasGPS(Boolean extrasGPS) { this.extrasGPS = extrasGPS; }

    public Boolean getExtrasChildSeat() { return extrasChildSeat; }
    public void setExtrasChildSeat(Boolean extrasChildSeat) { this.extrasChildSeat = extrasChildSeat; }

    public Boolean getExtrasExtraDriver() { return extrasExtraDriver; }
    public void setExtrasExtraDriver(Boolean extrasExtraDriver) { this.extrasExtraDriver = extrasExtraDriver; }

    public Boolean getExtrasInsurance() { return extrasInsurance; }
    public void setExtrasInsurance(Boolean extrasInsurance) { this.extrasInsurance = extrasInsurance; }

    public Boolean getExtrasFuelPrepay() { return extrasFuelPrepay; }
    public void setExtrasFuelPrepay(Boolean extrasFuelPrepay) { this.extrasFuelPrepay = extrasFuelPrepay; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }

    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
