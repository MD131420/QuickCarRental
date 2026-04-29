# QuickCarRental

A full-stack car rental web application built with Spring Boot and vanilla JavaScript. Customers can browse cars, make a reservation in under a minute, and manage their booking — all without creating an account. Every reservation gets a unique order number (e.g. `QCR-A7X9-K2M4`) used to track, modify or cancel the booking.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Backend** | Java 17, Spring Boot 3.2, REST API |
| **Database** | MySQL 8.0 |
| **ORM** | Hibernate / Spring Data JPA |
| **Build tool** | Maven |
| **Server** | Embedded Apache Tomcat (via Spring Boot) |

---

## Features

### Customer side
- Browse the full car fleet with filters — category, fuel type, transmission, seats, price range
- Sort by price or name
- View car details — specs, features, availability calendar
- Book a car with a simple form — no account required
- Receive a unique reservation token (`QCR-XXXX-XXXX`) on confirmation
- Look up a reservation by token — view status, details, price breakdown
- Cancel a booking (up to 24 hours before pickup)
- Modify rental dates or extend an active rental

### Admin panel
- Password-protected dashboard (`/admin.html`, default password: `admin123`)
- Live statistics — total cars, active bookings, daily revenue, 7-day booking chart
- Full car management — add, edit, delete, change availability status
- Full booking management — view all reservations, change booking status

---

## How It Works

```
Browser  ──→  HTML/CSS/JS (served by Spring Boot as static files)
                    │
                    │  HTTP requests (JSON)
                    ▼
            Spring Boot REST API
                    │
                    │  JPA / Hibernate
                    ▼
              MySQL Database
```

1. The frontend sends HTTP requests to the REST API (`/api/...`)
2. Controllers receive requests and pass them to Services
3. Services contain all business logic (date validation, price calculation, overlap checks)
4. Repositories handle database reads/writes via JPA
5. Responses are returned as JSON and rendered by the frontend JavaScript

### Price calculation (server-side)
```
Total = pricePerDay × days
      + GPS (€5/day)
      + Child Seat (€3/day)
      + Extra Driver (€10/day)
      + Insurance (€15/day)
      + Fuel Prepay (€40 flat)
```

---

## Project Structure

```
QuickCarRental/
├── START.bat                        # One-click launcher (build + run + open browser)
├── STOP.bat                         # Stops the running server
│
├── FRONTEND/                        # Static frontend (HTML/CSS/JS)
│   ├── index.html                   # Home page
│   ├── cars.html                    # Car listing with filters
│   ├── booking.html                 # Car detail + booking form
│   ├── booking-confirm.html         # Booking confirmation ticket
│   ├── check-reservation.html       # Reservation lookup & management
│   ├── admin.html                   # Admin panel
│   ├── about.html                   # About page
│   ├── contact.html                 # Contact page
│   ├── css/
│   │   ├── style.css                # Main stylesheet
│   │   └── responsive.css           # Mobile / tablet breakpoints
│   └── js/
│       ├── app.js                   # Shared logic (home, confirmation, contact)
│       ├── cars.js                  # Car listing page logic
│       ├── booking.js               # Booking form + date picker + price calc
│       ├── reservation-check.js     # Reservation lookup + cancel/modify/extend
│       └── admin.js                 # Admin panel logic
│
└── BACKEND/                         # Spring Boot application
    ├── pom.xml
    └── src/main/
        ├── java/com/quickcarrental/
        │   ├── controller/          # REST controllers (CarController, BookingController, AdminController)
        │   ├── service/             # Business logic (BookingService, CarService, TokenService)
        │   ├── repository/          # JPA repositories (CarRepository, BookingRepository)
        │   ├── model/               # JPA entities (Car, Booking, enums)
        │   ├── dto/                 # Request/Response DTOs
        │   ├── exception/           # Custom exceptions + GlobalExceptionHandler
        │   └── config/              # CORS configuration
        └── resources/
            ├── application.properties   # Database + server configuration
            └── import.sql               # Seed data (12 cars, 4 bookings)
```

---

## API Endpoints

### Cars — `/api/cars`
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/cars` | List cars (filters: category, fuel, transmission, seats, price, sort, page) |
| `GET` | `/api/cars/{id}` | Get single car |
| `GET` | `/api/cars/{id}/availability` | Get blocked date ranges for this car |
| `POST` | `/api/cars` | Add new car |
| `PUT` | `/api/cars/{id}` | Update car |
| `DELETE` | `/api/cars/{id}` | Delete car |
| `PATCH` | `/api/cars/{id}/status` | Change car status |

### Bookings — `/api/bookings`
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/bookings` | Create new booking |
| `GET` | `/api/bookings/{token}` | Get booking by reservation token |
| `PATCH` | `/api/bookings/{token}/cancel` | Cancel booking (24h+ before pickup) |
| `PATCH` | `/api/bookings/{token}/modify` | Change rental dates |
| `PATCH` | `/api/bookings/{token}/extend` | Extend return date (active bookings only) |
| `GET` | `/api/bookings` | List all bookings (admin) |
| `PATCH` | `/api/bookings/{token}/status` | Change booking status (admin) |

### Admin — `/api/admin`
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/admin/login` | Verify admin password |
| `GET` | `/api/admin/stats` | Dashboard statistics |

---

## How to Run

### Prerequisites
- **Java 17+** — [Download Temurin](https://adoptium.net/)
- **MySQL 8.0+** — running locally on port 3306

### 1. Set up the database

Open MySQL and run:
```sql
CREATE DATABASE quickcarrental;
```

### 2. Configure database credentials

Edit `BACKEND/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/quickcarrental?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=your_password
```

### 3. Start the application

Double-click **`START.bat`** — it will:
1. Detect Java automatically
2. Copy frontend files into the backend
3. Build the project with Maven
4. Start the Spring Boot server
5. Open the browser at `http://localhost:8080`

Tables are created automatically by Hibernate on first run. Seed data (12 cars + 4 sample bookings) is loaded from `import.sql`.

### 4. Stop the application

Double-click **`STOP.bat`** or close the `QuickCarRental Backend` console window.

---

## Default Credentials

| Access | Value |
|---|---|
| Admin panel URL | `http://localhost:8080/admin.html` |
| Admin password | `admin123` |
| MySQL user | `root` |
