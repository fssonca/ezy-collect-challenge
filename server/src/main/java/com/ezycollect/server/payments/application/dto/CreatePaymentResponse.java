package com.ezycollect.server.payments.application.dto;

import java.time.Instant;

public record CreatePaymentResponse(
        String id,
        String status,
        Instant createdAt
) {
}

