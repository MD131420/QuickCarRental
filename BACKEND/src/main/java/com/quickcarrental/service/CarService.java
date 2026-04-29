package com.quickcarrental.service;

import com.quickcarrental.dto.CarDTO;
import com.quickcarrental.exception.CarNotAvailableException;
import com.quickcarrental.model.Booking;
import com.quickcarrental.model.BookingStatus;
import com.quickcarrental.model.Car;
import com.quickcarrental.model.CarCategory;
import com.quickcarrental.repository.BookingRepository;
import com.quickcarrental.repository.CarRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

/**
 * Service layer for car fleet management.
 * Handles filtering/sorting/pagination of cars, CRUD operations,
 * and availability checking (returns date ranges when a car is already booked).
 */
@Service
public class CarService {

    private final CarRepository carRepository;
    private final BookingRepository bookingRepository;

    public CarService(CarRepository carRepository, BookingRepository bookingRepository) {
        this.carRepository = carRepository;
        this.bookingRepository = bookingRepository;
    }

    /**
     * Retrieves cars with optional filters (category, fuel, transmission, seats, price range),
     * sorting (price_asc, price_desc, name_asc, name_desc), and pagination.
     */
    public List<CarDTO> getAllCars(String category, String fuelType, String transmission,
                                   Integer seats, BigDecimal minPrice, BigDecimal maxPrice,
                                   String sort, int page, int size) {
        Sort sortOrder = Sort.unsorted();
        if (sort != null && !sort.isBlank()) {
            switch (sort) {
                case "price_asc" -> sortOrder = Sort.by(Sort.Direction.ASC, "pricePerDay");
                case "price_desc" -> sortOrder = Sort.by(Sort.Direction.DESC, "pricePerDay");
                case "name_asc" -> sortOrder = Sort.by(Sort.Direction.ASC, "brand");
                case "name_desc" -> sortOrder = Sort.by(Sort.Direction.DESC, "brand");
                default -> sortOrder = Sort.unsorted();
            }
        }

        CarCategory catEnum = null;
        if (category != null && !category.isBlank()) {
            try {
                catEnum = CarCategory.valueOf(category.toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }

        Pageable pageable = PageRequest.of(page, size, sortOrder);
        Page<Car> carsPage = carRepository.findByFilters(catEnum, fuelType, transmission, seats, minPrice, maxPrice, pageable);

        return carsPage.getContent().stream().map(CarDTO::fromCar).toList();
    }

    public CarDTO getCarById(Long id) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new CarNotAvailableException("Car not found with id: " + id));
        return CarDTO.fromCar(car);
    }

    /** Returns a list of booked date ranges for a car — used by the frontend date picker to block unavailable dates */
    public List<Map<String, Object>> getAvailability(Long id) {
        // Verify car exists
        carRepository.findById(id)
                .orElseThrow(() -> new CarNotAvailableException("Car not found with id: " + id));

        List<BookingStatus> activeStatuses = List.of(BookingStatus.CONFIRMED, BookingStatus.ACTIVE);
        List<Booking> bookings = bookingRepository.findByCarIdAndStatusIn(id, activeStatuses);

        List<Map<String, Object>> blockedRanges = new ArrayList<>();
        for (Booking booking : bookings) {
            Map<String, Object> range = new LinkedHashMap<>();
            range.put("startDate", booking.getPickupDate().toString());
            range.put("endDate", booking.getReturnDate().toString());
            blockedRanges.add(range);
        }
        return blockedRanges;
    }

    public Car addCar(Car car) {
        return carRepository.save(car);
    }

    /** Updates all fields of an existing car (full replacement of mutable properties) */
    public Car updateCar(Long id, Car carDetails) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new CarNotAvailableException("Car not found with id: " + id));
        car.setBrand(carDetails.getBrand());
        car.setModel(carDetails.getModel());
        car.setYear(carDetails.getYear());
        car.setCategory(carDetails.getCategory());
        car.setPricePerDay(carDetails.getPricePerDay());
        car.setTransmission(carDetails.getTransmission());
        car.setFuelType(carDetails.getFuelType());
        car.setSeats(carDetails.getSeats());
        car.setDoors(carDetails.getDoors());
        car.setTrunkCapacity(carDetails.getTrunkCapacity());
        car.setEnginePower(carDetails.getEnginePower());
        car.setHasAC(carDetails.getHasAC());
        car.setHasGPS(carDetails.getHasGPS());
        car.setHasBluetooth(carDetails.getHasBluetooth());
        car.setHasRearCamera(carDetails.getHasRearCamera());
        car.setImageUrl(carDetails.getImageUrl());
        car.setStatus(carDetails.getStatus());
        car.setLicensePlate(carDetails.getLicensePlate());
        car.setDescription(carDetails.getDescription());
        return carRepository.save(car);
    }

    public void deleteCar(Long id) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new CarNotAvailableException("Car not found with id: " + id));
        carRepository.delete(car);
    }

    public Car updateCarStatus(Long id, String status) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new CarNotAvailableException("Car not found with id: " + id));
        car.setStatus(status);
        return carRepository.save(car);
    }
}
