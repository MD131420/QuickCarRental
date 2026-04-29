package com.quickcarrental.model;

/**
 * Enum defining the available car categories in the rental fleet.
 * Used for filtering cars on the frontend and stored as a string in the database.
 */
public enum CarCategory {
    ECONOMY,    // Budget-friendly vehicles (e.g. Toyota Yaris)
    COMFORT,    // Mid-range sedans (e.g. Volkswagen Golf)
    SUV,        // Sport utility vehicles (e.g. Hyundai Tucson)
    PREMIUM,    // Luxury cars (e.g. BMW 5 Series)
    VAN         // Multi-passenger vehicles (e.g. Ford Transit)
}
