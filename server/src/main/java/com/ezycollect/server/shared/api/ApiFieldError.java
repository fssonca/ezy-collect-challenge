package com.ezycollect.server.shared.api;

import io.swagger.v3.oas.annotations.media.Schema;

public record ApiFieldError(
        @Schema(example = "expiry")
        String field,
        @Schema(example = "expiry must be in MM/YY format with month 01-12")
        String message
) {
}
