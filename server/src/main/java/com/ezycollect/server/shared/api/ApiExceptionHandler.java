package com.ezycollect.server.shared.api;

import com.ezycollect.server.payments.application.error.IdempotencyConflictException;
import com.ezycollect.server.payments.application.error.MissingIdempotencyKeyException;
import java.util.Comparator;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<ApiFieldError> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .sorted(Comparator.comparing(FieldError::getField))
                .map(fieldError -> new ApiFieldError(fieldError.getField(), fieldError.getDefaultMessage()))
                .toList();

        ApiErrorResponse response = new ApiErrorResponse(
                "VALIDATION_ERROR",
                "Request validation failed",
                fieldErrors);
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<ApiErrorResponse> handleMissingHeader(MissingRequestHeaderException ex) {
        if ("Idempotency-Key".equalsIgnoreCase(ex.getHeaderName())) {
            return ResponseEntity.badRequest()
                    .body(ApiErrorResponse.simple("MISSING_IDEMPOTENCY_KEY", "Idempotency-Key header is required"));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiErrorResponse.simple("VALIDATION_ERROR", "Required header is missing"));
    }

    @ExceptionHandler(MissingIdempotencyKeyException.class)
    public ResponseEntity<ApiErrorResponse> handleBlankIdempotencyKey(MissingIdempotencyKeyException ex) {
        return ResponseEntity.badRequest()
                .body(ApiErrorResponse.simple("MISSING_IDEMPOTENCY_KEY", ex.getMessage()));
    }

    @ExceptionHandler(IdempotencyConflictException.class)
    public ResponseEntity<ApiErrorResponse> handleIdempotencyConflict(IdempotencyConflictException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiErrorResponse.simple("IDEMPOTENCY_KEY_REUSED", ex.getMessage()));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidJson(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest()
                .body(ApiErrorResponse.simple("VALIDATION_ERROR", "Malformed JSON request"));
    }
}
