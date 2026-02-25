package com.ezycollect.server.payments.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;

public record CreatePaymentResponse(
        @Schema(description = "Payment identifier (UUID)", example = "b9ec8bf8-34ef-4d90-97d2-3ec9bd4b3400")
        String id,
        @Schema(description = "Payment processing status", example = "CREATED")
        String status,
        @Schema(description = "Creation timestamp in ISO-8601 UTC", example = "2026-02-25T12:34:56Z")
        Instant createdAt
) {
}
