package com.quickcarrental.controller;

import com.quickcarrental.model.ContactMessage;
import com.quickcarrental.repository.ContactMessageRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for contact form submissions.
 * POST /api/contact — saves a message from the contact form to the database.
 * PATCH /api/contact/{id}/read — marks a message as read (admin).
 */
@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactMessageRepository contactMessageRepository;

    public ContactController(ContactMessageRepository contactMessageRepository) {
        this.contactMessageRepository = contactMessageRepository;
    }

    /** POST /api/contact — receives and saves a contact form submission */
    @PostMapping
    public ResponseEntity<Map<String, String>> submitMessage(@RequestBody Map<String, String> body) {
        String name    = body.getOrDefault("name", "").trim();
        String email   = body.getOrDefault("email", "").trim();
        String subject = body.getOrDefault("subject", "").trim();
        String message = body.getOrDefault("message", "").trim();

        if (name.isEmpty() || email.isEmpty() || message.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name, email and message are required"));
        }

        ContactMessage cm = new ContactMessage();
        cm.setName(name);
        cm.setEmail(email);
        cm.setSubject(subject.isEmpty() ? "(no subject)" : subject);
        cm.setMessage(message);

        contactMessageRepository.save(cm);
        return ResponseEntity.ok(Map.of("status", "sent"));
    }

    /** PATCH /api/contact/{id}/read — marks a message as read */
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        contactMessageRepository.findById(id).ifPresent(cm -> {
            cm.setRead(true);
            contactMessageRepository.save(cm);
        });
        return ResponseEntity.ok().build();
    }
}
