package com.quickcarrental.controller;

import com.quickcarrental.model.ContactMessage;
import com.quickcarrental.repository.ContactMessageRepository;
import com.quickcarrental.service.BookingService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for admin panel endpoints.
 * Base path: /api/admin
 * Provides password-based login, dashboard statistics, and contact messages management.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final BookingService bookingService;
    private final ContactMessageRepository contactMessageRepository;

    // Admin password loaded from application.properties (app.admin.password)
    @Value("${app.admin.password}")
    private String adminPassword;

    public AdminController(BookingService bookingService, ContactMessageRepository contactMessageRepository) {
        this.bookingService = bookingService;
        this.contactMessageRepository = contactMessageRepository;
    }

    /** POST /api/admin/login — Verifies the admin password, returns {success: true/false} */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Boolean>> verifyPassword(@RequestBody Map<String, String> body) {
        String password = body.get("password");
        boolean success = adminPassword.equals(password);
        return ResponseEntity.ok(Map.of("success", success));
    }

    /** GET /api/admin/stats — Returns dashboard statistics including unread messages count */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = bookingService.getStats();
        stats.put("unreadMessages", contactMessageRepository.countByIsReadFalse());
        return ResponseEntity.ok(stats);
    }

    /** GET /api/admin/messages — Returns all contact form messages (newest first) */
    @GetMapping("/messages")
    public ResponseEntity<List<ContactMessage>> getMessages() {
        List<ContactMessage> messages = contactMessageRepository.findAll();
        messages.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        return ResponseEntity.ok(messages);
    }
}
