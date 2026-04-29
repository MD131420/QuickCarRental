package com.quickcarrental.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;

/**
 * Service responsible for generating unique reservation tokens.
 * Produces tokens in the format QCR-XXXX-XXXX (e.g. QCR-T1A2-B3C4)
 * using cryptographically secure random characters (A-Z, 0-9).
 */
@Service
public class TokenService {

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    /** Generates a unique reservation token like QCR-A1B2-C3D4 */
    public String generateToken() {
        return "QCR-" + randomSegment(4) + "-" + randomSegment(4);
    }

    private String randomSegment(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(CHARACTERS.charAt(RANDOM.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }
}
