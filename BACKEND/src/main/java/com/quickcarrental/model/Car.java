package com.quickcarrental.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * JPA entity representing a car in the rental fleet.
 * Maps to the "cars" table in the H2 database.
 * Contains vehicle specifications (brand, model, seats, engine, features)
 * and rental metadata (price per day, status, license plate).
 */
@Entity
@Table(name = "cars")
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment primary key
    private Long id;

    @NotBlank
    @Column(name = "brand", nullable = false)
    private String brand;

    @NotBlank
    @Column(name = "model", nullable = false)
    private String model;

    @Column(name = "production_year")
    private Integer year;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private CarCategory category;

    @NotNull
    @Column(name = "price_per_day", nullable = false)
    private BigDecimal pricePerDay;

    @Column(name = "transmission")
    private String transmission;

    @Column(name = "fuel_type")
    private String fuelType;

    @Column(name = "seats")
    private Integer seats;

    @Column(name = "doors")
    private Integer doors;

    @Column(name = "trunk_capacity")
    private String trunkCapacity;

    @Column(name = "engine_power")
    private String enginePower;

    @Column(name = "has_ac")
    private Boolean hasAC;

    @Column(name = "has_gps")
    private Boolean hasGPS;

    @Column(name = "has_bluetooth")
    private Boolean hasBluetooth;

    @Column(name = "has_rear_camera")
    private Boolean hasRearCamera;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "status")
    private String status;

    @Column(name = "license_plate")
    private String licensePlate;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Car() {
    }

    /**
     * JPA lifecycle callback — runs automatically before a new Car is saved.
     * Sets default values for createdAt timestamp and availability status.
     */
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "available";
        }
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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
