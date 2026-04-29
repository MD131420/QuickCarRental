package com.quickcarrental.repository;

import com.quickcarrental.model.Car;
import com.quickcarrental.model.CarCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

/**
 * Spring Data JPA repository for Car entities.
 * Extends JpaRepository which provides standard CRUD methods (save, findById, findAll, delete).
 * Custom query methods are derived from method names or defined with @Query (JPQL).
 */
@Repository
public interface CarRepository extends JpaRepository<Car, Long> {

    /** Find all cars with a given status (e.g. "available", "maintenance") */
    List<Car> findByStatus(String status);

    /** Find all cars in a specific category */
    List<Car> findByCategory(CarCategory category);

    /** Custom JPQL query — filters cars by multiple optional criteria with pagination support */
    @Query("SELECT c FROM Car c WHERE " +
           "(:category IS NULL OR c.category = :category) AND " +
           "(:fuelType IS NULL OR c.fuelType = :fuelType) AND " +
           "(:transmission IS NULL OR c.transmission = :transmission) AND " +
           "(:seats IS NULL OR c.seats = :seats) AND " +
           "(:minPrice IS NULL OR c.pricePerDay >= :minPrice) AND " +
           "(:maxPrice IS NULL OR c.pricePerDay <= :maxPrice)")
    Page<Car> findByFilters(
            @Param("category") CarCategory category,
            @Param("fuelType") String fuelType,
            @Param("transmission") String transmission,
            @Param("seats") Integer seats,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable
    );
}
