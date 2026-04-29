package com.quickcarrental.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

/**
 * Data Transfer Object for incoming booking requests from the frontend.
 * Contains validation annotations that Spring enforces automatically
 * when @Valid is used in the controller.
 */
public class BookingRequest {

    @NotNull(message = "Car ID is required")
    private Long carId;

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotBlank(message = "Customer email is required")
    @Email(message = "Invalid email format")
    private String customerEmail;

    private String customerPhone;

    @NotNull(message = "Pickup date is required")
    @FutureOrPresent(message = "Pickup date must be today or in the future")
    private LocalDate pickupDate;

    @NotNull(message = "Return date is required")
    @Future(message = "Return date must be in the future")
    private LocalDate returnDate;

    private String pickupLocation;
    private String returnLocation;

    private boolean extrasGPS;
    private boolean extrasChildSeat;
    private boolean extrasExtraDriver;
    private boolean extrasInsurance;
    private boolean extrasFuelPrepay;

    private String notes;

    public BookingRequest() {
    }

    // Getters and Setters

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
}
