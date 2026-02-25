package com.ezycollect.server.shared.api;

import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

public record ApiErrorResponse(
        @Schema(example = "VALIDATION_ERROR")
        String code,
        @Schema(example = "Request validation failed")
        String message,
        @ArraySchema(schema = @Schema(implementation = ApiFieldError.class))
        List<ApiFieldError> fieldErrors
) {
    public static ApiErrorResponse simple(String code, String message) {
        return new ApiErrorResponse(code, message, List.of());
    }
}
