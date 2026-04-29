package com.quickcarrental.dto;

import com.quickcarrental.model.Booking;
import com.quickcarrental.model.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for booking responses sent to the frontend.
 * Enriches the raw Booking entity with car details (brand, model, image)
 * so the frontend can display complete information in a single API call.
 */
public class BookingResponse {

    private Long id;
    private String reservationToken;
    private Long carId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private LocalDate pickupDate;
    private LocalDate returnDate;
    private String pickupLocation;
    private String returnLocation;
    private boolean extrasGPS;
    private boolean extrasChildSeat;
    private boolean extrasExtraDriver;
    private boolean extrasInsurance;
    private boolean extrasFuelPrepay;
    private String notes;
    private BigDecimal totalPrice;
    private BookingStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Car details for display
    private String carBrand;
    private String carModel;
    private String carCategory;
    private String carLicensePlate;
    private BigDecimal carPricePerDay;
    private String carImageUrl;

    public BookingResponse() {
    }

    /** Factory method — converts a Booking entity into a BookingResponse DTO */
    public static BookingResponse fromBooking(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setReservationToken(booking.getReservationToken());
        response.setCarId(booking.getCarId());
        response.setCustomerName(booking.getCustomerName());
        response.setCustomerEmail(booking.getCustomerEmail());
        response.setCustomerPhone(booking.getCustomerPhone());
        response.setPickupDate(booking.getPickupDate());
        response.setReturnDate(booking.getReturnDate());
        response.setPickupLocation(booking.getPickupLocation());
        response.setReturnLocation(booking.getReturnLocation());
        response.setExtrasGPS(Boolean.TRUE.equals(booking.getExtrasGPS()));
        response.setExtrasChildSeat(Boolean.TRUE.equals(booking.getExtrasChildSeat()));
        response.setExtrasExtraDriver(Boolean.TRUE.equals(booking.getExtrasExtraDriver()));
        response.setExtrasInsurance(Boolean.TRUE.equals(booking.getExtrasInsurance()));
        response.setExtrasFuelPrepay(Boolean.TRUE.equals(booking.getExtrasFuelPrepay()));
        response.setNotes(booking.getNotes());
        response.setTotalPrice(booking.getTotalPrice());
        response.setStatus(booking.getStatus());
        response.setCreatedAt(booking.getCreatedAt());
        response.setUpdatedAt(booking.getUpdatedAt());
        return response;
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

    public boolean isExtrasGPS() { return extrasGPS; }
    public void setExtrasGPS(boolean extrasGPS) { this.extrasGPS = extrasGPS; }

    public boolean isExtrasChildSeat() { return extrasChildSeat; }
    public void setExtrasChildSeat(boolean extrasChildSeat) { this.extrasChildSeat = extrasChildSeat; }

    public boolean isExtrasExtraDriver() { return extrasExtraDriver; }
    public void setExtrasExtraDriver(boolean extrasExtraDriver) { this.extrasExtraDriver = extrasExtraDriver; }

    public boolean isExtrasInsurance() { return extrasInsurance; }
    public void setExtrasInsurance(boolean extrasInsurance) { this.extrasInsurance = extrasInsurance; }

    public boolean isExtrasFuelPrepay() { return extrasFuelPrepay; }
    public void setExtrasFuelPrepay(boolean extrasFuelPrepay) { this.extrasFuelPrepay = extrasFuelPrepay; }

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

    public String getCarBrand() { return carBrand; }
    public void setCarBrand(String carBrand) { this.carBrand = carBrand; }

    public String getCarModel() { return carModel; }
    public void setCarModel(String carModel) { this.carModel = carModel; }

    public String getCarImageUrl() { return carImageUrl; }
    public void setCarImageUrl(String carImageUrl) { this.carImageUrl = carImageUrl; }

    public String getCarCategory() { return carCategory; }
    public void setCarCategory(String carCategory) { this.carCategory = carCategory; }

    public String getCarLicensePlate() { return carLicensePlate; }
    public void setCarLicensePlate(String carLicensePlate) { this.carLicensePlate = carLicensePlate; }

    public BigDecimal getCarPricePerDay() { return carPricePerDay; }
    public void setCarPricePerDay(BigDecimal carPricePerDay) { this.carPricePerDay = carPricePerDay; }
}
