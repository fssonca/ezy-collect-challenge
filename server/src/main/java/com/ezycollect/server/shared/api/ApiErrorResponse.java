package com.ezycollect.server.shared.api;

import java.util.List;

public record ApiErrorResponse(
        String code,
        String message,
        List<ApiFieldError> fieldErrors
) {
    public static ApiErrorResponse simple(String code, String message) {
        return new ApiErrorResponse(code, message, List.of());
    }
}

