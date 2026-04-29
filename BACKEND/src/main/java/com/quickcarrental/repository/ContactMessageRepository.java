package com.quickcarrental.repository;

import com.quickcarrental.model.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * JPA repository for ContactMessage entities.
 * Provides CRUD operations and unread count for the admin dashboard.
 */
@Repository
public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {

    /** Count unread messages — used for the admin dashboard badge */
    long countByIsReadFalse();
}
