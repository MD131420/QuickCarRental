package com.quickcarrental.controller;

import com.quickcarrental.dto.CarDTO;
import com.quickcarrental.model.Car;
import com.quickcarrental.service.CarService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * REST controller for car-related endpoints.
 * Base path: /api/cars
 * Provides CRUD operations for the car fleet and availability checking.
 */
@RestController
@RequestMapping("/api/cars")
public class CarController {

    private final CarService carService;

    // Constructor injection — Spring automatically injects the CarService bean
    public CarController(CarService carService) {
        this.carService = carService;
    }

    /** GET /api/cars — Returns a filtered, sorted, paginated list of cars */
    @GetMapping
    public ResponseEntity<List<CarDTO>> getAllCars(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String fuelType,
            @RequestParam(required = false) String transmission,
            @RequestParam(required = false) Integer seats,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<CarDTO> cars = carService.getAllCars(category, fuelType, transmission, seats, minPrice, maxPrice, sort, page, size);
        return ResponseEntity.ok(cars);
    }

    /** GET /api/cars/{id} — Returns details of a single car by its ID */
    @GetMapping("/{id}")
    public ResponseEntity<CarDTO> getCarById(@PathVariable Long id) {
        CarDTO car = carService.getCarById(id);
        return ResponseEntity.ok(car);
    }

    /** GET /api/cars/{id}/availability — Returns blocked date ranges for the car (existing bookings) */
    @GetMapping("/{id}/availability")
    public ResponseEntity<List<Map<String, Object>>> getAvailability(@PathVariable Long id) {
        List<Map<String, Object>> blockedDates = carService.getAvailability(id);
        return ResponseEntity.ok(blockedDates);
    }

    /** POST /api/cars — Adds a new car to the fleet (used by admin panel) */
    @PostMapping
    public ResponseEntity<Car> addCar(@Valid @RequestBody Car car) {
        Car createdCar = carService.addCar(car);
        return ResponseEntity.status(201).body(createdCar);
    }

    /** PUT /api/cars/{id} — Updates all fields of an existing car */
    @PutMapping("/{id}")
    public ResponseEntity<Car> updateCar(@PathVariable Long id, @Valid @RequestBody Car car) {
        Car updatedCar = carService.updateCar(id, car);
        return ResponseEntity.ok(updatedCar);
    }

    /** DELETE /api/cars/{id} — Removes a car from the fleet */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCar(@PathVariable Long id) {
        carService.deleteCar(id);
        return ResponseEntity.noContent().build();
    }

    /** PATCH /api/cars/{id}/status — Changes car status (e.g. "available" / "maintenance") */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Car> updateCarStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        Car updatedCar = carService.updateCarStatus(id, status);
        return ResponseEntity.ok(updatedCar);
    }
}
