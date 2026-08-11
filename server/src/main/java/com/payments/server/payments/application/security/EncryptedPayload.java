package com.payments.server.payments.application.security;

public record EncryptedPayload(
        byte[] iv,
        byte[] ciphertext
) {
}

