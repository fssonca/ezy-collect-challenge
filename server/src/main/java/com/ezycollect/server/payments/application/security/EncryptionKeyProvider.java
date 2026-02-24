package com.ezycollect.server.payments.application.security;

import java.util.Base64;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class EncryptionKeyProvider {

    private static final int KEY_LENGTH_BYTES = 32;

    private final SecretKey secretKey;

    public EncryptionKeyProvider(@Value("${PAYMENTS_ENCRYPTION_KEY_B64:}") String keyB64) {
        this.secretKey = new SecretKeySpec(decodeAndValidate(keyB64), "AES");
    }

    public SecretKey secretKey() {
        return secretKey;
    }

    static byte[] decodeAndValidate(String keyB64) {
        if (keyB64 == null || keyB64.isBlank()) {
            throw new IllegalStateException("PAYMENTS_ENCRYPTION_KEY_B64 is required and must be a base64-encoded 32-byte key");
        }

        byte[] keyBytes;
        try {
            keyBytes = Base64.getDecoder().decode(keyB64);
        } catch (IllegalArgumentException ex) {
            throw new IllegalStateException("PAYMENTS_ENCRYPTION_KEY_B64 must be valid base64", ex);
        }

        if (keyBytes.length != KEY_LENGTH_BYTES) {
            throw new IllegalStateException("PAYMENTS_ENCRYPTION_KEY_B64 must decode to exactly 32 bytes (256-bit key)");
        }
        return keyBytes;
    }
}

