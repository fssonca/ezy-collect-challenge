package com.ezycollect.server.shared.api;

public record ApiFieldError(
        String field,
        String message
) {
}

