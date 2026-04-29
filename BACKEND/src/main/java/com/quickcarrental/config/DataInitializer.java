package com.quickcarrental.config;

import com.quickcarrental.model.*;
import com.quickcarrental.repository.BookingRepository;
import com.quickcarrental.repository.CarRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Runs once on application startup.
 * Seeds the database with 12 cars and 4 sample bookings
 * only if the cars table is empty (fresh install or wiped database).
 * On subsequent restarts, data is preserved — nothing is inserted.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final CarRepository carRepository;
    private final BookingRepository bookingRepository;

    public DataInitializer(CarRepository carRepository, BookingRepository bookingRepository) {
        this.carRepository = carRepository;
        this.bookingRepository = bookingRepository;
    }

    @Override
    public void run(String... args) {
        // Skip seeding if data already exists
        if (carRepository.count() > 0) {
            return;
        }
        List<Car> cars = seedCars();
        seedBookings(cars);
    }

    // ── Seed Cars ──────────────────────────────────────────────────

    private List<Car> seedCars() {
        List<Car> cars = List.of(
            car("Fiat", "500", 2023, CarCategory.ECONOMY, 25.00, "manual", "petrol",
                4, 3, "185L", "70 HP", true, false, true, false,
                "/assets/images/fiat500.jpg", "QCR-EC-001",
                "Compact and fuel-efficient city car."),

            car("Toyota", "Yaris", 2024, CarCategory.ECONOMY, 30.00, "automatic", "hybrid",
                5, 5, "286L", "116 HP", true, true, true, true,
                "/assets/images/yaris.jpg", "QCR-EC-002",
                "Reliable hybrid hatchback with excellent fuel economy."),

            car("Volkswagen", "Golf", 2024, CarCategory.COMFORT, 55.00, "automatic", "petrol",
                5, 5, "380L", "150 HP", true, true, true, true,
                "/assets/images/golf.jpg", "QCR-CO-001",
                "Iconic compact car with comfort and performance."),

            car("Hyundai", "Sonata", 2024, CarCategory.COMFORT, 60.00, "automatic", "petrol",
                5, 4, "462L", "191 HP", true, true, true, true,
                "/assets/images/sonata.jpg", "QCR-CO-002",
                "Spacious sedan with premium interior."),

            car("Renault", "Megane", 2023, CarCategory.COMFORT, 50.00, "manual", "diesel",
                5, 5, "384L", "115 HP", true, false, true, false,
                "/assets/images/megane.jpg", "QCR-CO-003",
                "Versatile family car with efficient diesel engine."),

            car("Toyota", "RAV4", 2024, CarCategory.SUV, 80.00, "automatic", "hybrid",
                5, 5, "580L", "222 HP", true, true, true, true,
                "/assets/images/rav4.jpg", "QCR-SU-001",
                "Popular hybrid SUV with generous cargo space."),

            car("Kia", "Sportage", 2024, CarCategory.SUV, 75.00, "automatic", "diesel",
                5, 5, "543L", "186 HP", true, true, true, true,
                "/assets/images/sportage.jpg", "QCR-SU-002",
                "Stylish SUV with panoramic display and spacious cabin."),

            car("BMW", "5 Series", 2024, CarCategory.PREMIUM, 130.00, "automatic", "petrol",
                5, 4, "520L", "255 HP", true, true, true, true,
                "/assets/images/bmw5.jpg", "QCR-PR-001",
                "Luxury sedan with exceptional driving dynamics."),

            car("Mercedes", "E-Class", 2024, CarCategory.PREMIUM, 140.00, "automatic", "diesel",
                5, 4, "540L", "265 HP", true, true, true, true,
                "/assets/images/eclass.jpg", "QCR-PR-002",
                "Elegant executive sedan with supreme comfort."),

            car("Tesla", "Model 3", 2024, CarCategory.PREMIUM, 110.00, "automatic", "electric",
                5, 4, "425L", "283 HP", true, true, true, true,
                "/assets/images/model3.jpg", "QCR-PR-003",
                "All-electric premium sedan with autopilot."),

            car("Ford", "Transit Custom", 2023, CarCategory.VAN, 90.00, "manual", "diesel",
                3, 4, "6000L", "170 HP", true, false, true, true,
                "/assets/images/transit.jpg", "QCR-VA-001",
                "Versatile cargo van for moving and deliveries."),

            car("Volkswagen", "Multivan", 2024, CarCategory.VAN, 100.00, "automatic", "diesel",
                7, 5, "763L", "150 HP", true, true, true, true,
                "/assets/images/multivan.jpg", "QCR-VA-002",
                "Premium people carrier for up to 7 passengers.")
        );

        return carRepository.saveAll(cars);
    }

    // ── Seed Bookings ──────────────────────────────────────────────

    private void seedBookings(List<Car> cars) {
        // cars list index: 0=Fiat500, 1=Yaris, 2=Golf, 3=Sonata, 4=Megane,
        //                  5=RAV4, 6=Sportage, 7=BMW5, 8=Mercedes, 9=Tesla,
        //                  10=Transit, 11=Multivan

        List<Booking> bookings = List.of(
            booking("QCR-T1A2-B3C4", cars.get(2).getId(),
                "Jan Kowalski", "jan.kowalski@email.com", "+48 600 100 200",
                LocalDate.of(2026, 4, 5), LocalDate.of(2026, 4, 10),
                "Airport", "Airport",
                true, false, false, true, false,
                "Business trip", new BigDecimal("375.00"), BookingStatus.CONFIRMED),

            booking("QCR-D5E6-F7G8", cars.get(5).getId(),
                "Anna Nowak", "anna.nowak@email.com", "+48 601 200 300",
                LocalDate.of(2026, 3, 25), LocalDate.of(2026, 4, 2),
                "City Center", "City Center",
                false, true, false, true, true,
                "Family vacation", new BigDecimal("824.00"), BookingStatus.ACTIVE),

            booking("QCR-H9I0-J1K2", cars.get(7).getId(),
                "Piotr Wisniewski", "piotr.w@email.com", "+48 602 300 400",
                LocalDate.of(2026, 3, 10), LocalDate.of(2026, 3, 15),
                "Train Station", "Airport",
                true, false, true, true, false,
                null, new BigDecimal("800.00"), BookingStatus.COMPLETED),

            booking("QCR-L3M4-N5O6", cars.get(0).getId(),
                "Maria Dabrowska", "maria.d@email.com", "+48 603 400 500",
                LocalDate.of(2026, 4, 1), LocalDate.of(2026, 4, 3),
                "Hotel Delivery", "Hotel Delivery",
                false, false, false, false, false,
                "Cancelled", new BigDecimal("50.00"), BookingStatus.CANCELLED)
        );

        bookingRepository.saveAll(bookings);
    }

    // ── Helper builders ────────────────────────────────────────────

    private Car car(String brand, String model, int year, CarCategory category,
                    double price, String transmission, String fuelType,
                    int seats, int doors, String trunk, String engine,
                    boolean ac, boolean gps, boolean bt, boolean cam,
                    String imageUrl, String plate, String description) {
        Car c = new Car();
        c.setBrand(brand);
        c.setModel(model);
        c.setYear(year);
        c.setCategory(category);
        c.setPricePerDay(BigDecimal.valueOf(price));
        c.setTransmission(transmission);
        c.setFuelType(fuelType);
        c.setSeats(seats);
        c.setDoors(doors);
        c.setTrunkCapacity(trunk);
        c.setEnginePower(engine);
        c.setHasAC(ac);
        c.setHasGPS(gps);
        c.setHasBluetooth(bt);
        c.setHasRearCamera(cam);
        c.setImageUrl(imageUrl);
        c.setLicensePlate(plate);
        c.setDescription(description);
        return c;
    }

    private Booking booking(String token, Long carId,
                            String name, String email, String phone,
                            LocalDate pickup, LocalDate returnDate,
                            String pickupLoc, String returnLoc,
                            boolean gps, boolean childSeat, boolean extraDriver,
                            boolean insurance, boolean fuelPrepay,
                            String notes, BigDecimal price, BookingStatus status) {
        Booking b = new Booking();
        b.setReservationToken(token);
        b.setCarId(carId);
        b.setCustomerName(name);
        b.setCustomerEmail(email);
        b.setCustomerPhone(phone);
        b.setPickupDate(pickup);
        b.setReturnDate(returnDate);
        b.setPickupLocation(pickupLoc);
        b.setReturnLocation(returnLoc);
        b.setExtrasGPS(gps);
        b.setExtrasChildSeat(childSeat);
        b.setExtrasExtraDriver(extraDriver);
        b.setExtrasInsurance(insurance);
        b.setExtrasFuelPrepay(fuelPrepay);
        b.setNotes(notes);
        b.setTotalPrice(price);
        b.setStatus(status);
        return b;
    }
}
