package com.quickcarrental.dto;

import com.quickcarrental.model.Car;
import com.quickcarrental.model.CarCategory;

import java.math.BigDecimal;

/**
 * Data Transfer Object for car data sent to the frontend.
 * Decouples the API response from the internal Car entity structure.
 */
public class CarDTO {

    private Long id;
    private String brand;
    private String model;
    private Integer year;
    private CarCategory category;
    private BigDecimal pricePerDay;
    private String transmission;
    private String fuelType;
    private Integer seats;
    private Integer doors;
    private String trunkCapacity;
    private String enginePower;
    private Boolean hasAC;
    private Boolean hasGPS;
    private Boolean hasBluetooth;
    private Boolean hasRearCamera;
    private String imageUrl;
    private String status;
    private String licensePlate;
    private String description;

    public CarDTO() {
    }

    /** Factory method — converts a Car entity into a CarDTO */
    public static CarDTO fromCar(Car car) {
        CarDTO dto = new CarDTO();
        dto.setId(car.getId());
        dto.setBrand(car.getBrand());
        dto.setModel(car.getModel());
        dto.setYear(car.getYear());
        dto.setCategory(car.getCategory());
        dto.setPricePerDay(car.getPricePerDay());
        dto.setTransmission(car.getTransmission());
        dto.setFuelType(car.getFuelType());
        dto.setSeats(car.getSeats());
        dto.setDoors(car.getDoors());
        dto.setTrunkCapacity(car.getTrunkCapacity());
        dto.setEnginePower(car.getEnginePower());
        dto.setHasAC(car.getHasAC());
        dto.setHasGPS(car.getHasGPS());
        dto.setHasBluetooth(car.getHasBluetooth());
        dto.setHasRearCamera(car.getHasRearCamera());
        dto.setImageUrl(car.getImageUrl());
        dto.setStatus(car.getStatus());
        dto.setLicensePlate(car.getLicensePlate());
        dto.setDescription(car.getDescription());
        return dto;
    }

    // Getters and Setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public CarCategory getCategory() { return category; }
    public void setCategory(CarCategory category) { this.category = category; }

    public BigDecimal getPricePerDay() { return pricePerDay; }
    public void setPricePerDay(BigDecimal pricePerDay) { this.pricePerDay = pricePerDay; }

    public String getTransmission() { return transmission; }
    public void setTransmission(String transmission) { this.transmission = transmission; }

    public String getFuelType() { return fuelType; }
    public void setFuelType(String fuelType) { this.fuelType = fuelType; }

    public Integer getSeats() { return seats; }
    public void setSeats(Integer seats) { this.seats = seats; }

    public Integer getDoors() { return doors; }
    public void setDoors(Integer doors) { this.doors = doors; }

    public String getTrunkCapacity() { return trunkCapacity; }
    public void setTrunkCapacity(String trunkCapacity) { this.trunkCapacity = trunkCapacity; }

    public String getEnginePower() { return enginePower; }
    public void setEnginePower(String enginePower) { this.enginePower = enginePower; }

    public Boolean getHasAC() { return hasAC; }
    public void setHasAC(Boolean hasAC) { this.hasAC = hasAC; }

    public Boolean getHasGPS() { return hasGPS; }
    public void setHasGPS(Boolean hasGPS) { this.hasGPS = hasGPS; }

    public Boolean getHasBluetooth() { return hasBluetooth; }
    public void setHasBluetooth(Boolean hasBluetooth) { this.hasBluetooth = hasBluetooth; }

    public Boolean getHasRearCamera() { return hasRearCamera; }
    public void setHasRearCamera(Boolean hasRearCamera) { this.hasRearCamera = hasRearCamera; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
