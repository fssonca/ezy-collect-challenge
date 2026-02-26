package com.ezycollect.server.payments.api;

import com.ezycollect.server.payments.application.PaymentService;
import com.ezycollect.server.payments.application.PaymentServiceResult;
import com.ezycollect.server.payments.application.dto.CreatePaymentRequest;
import com.ezycollect.server.payments.application.dto.CreatePaymentResponse;
import com.ezycollect.server.payments.application.error.MissingIdempotencyKeyException;
import com.ezycollect.server.shared.api.ApiErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/payments", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment creation API")
public class PaymentsController {

    private final PaymentService paymentService;

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
            summary = "Create a payment",
            description = "Creates a payment on first request and replays the same response for the same Idempotency-Key and identical payload.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Payment created",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = CreatePaymentResponse.class),
                            examples = @ExampleObject(
                                    name = "created",
                                    value = "{\"id\":\"b9ec8bf8-34ef-4d90-97d2-3ec9bd4b3400\",\"status\":\"CREATED\",\"createdAt\":\"2026-02-25T12:34:56Z\"}"))),
            @ApiResponse(
                    responseCode = "200",
                    description = "Idempotent replay (same key and same payload)",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = CreatePaymentResponse.class),
                            examples = @ExampleObject(
                                    name = "replay",
                                    value = "{\"id\":\"b9ec8bf8-34ef-4d90-97d2-3ec9bd4b3400\",\"status\":\"CREATED\",\"createdAt\":\"2026-02-25T12:34:56Z\"}"))),
            @ApiResponse(
                    responseCode = "400",
                    description = "Validation error or missing/blank Idempotency-Key header",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ApiErrorResponse.class),
                            examples = {
                                    @ExampleObject(
                                            name = "validationError",
                                            value = "{\"code\":\"VALIDATION_ERROR\",\"message\":\"Request validation failed\",\"fieldErrors\":[{\"field\":\"expiry\",\"message\":\"expiry must be in MM/YY format with month 01-12\"}]}"),
                                    @ExampleObject(
                                            name = "missingIdempotencyKey",
                                            value = "{\"code\":\"MISSING_IDEMPOTENCY_KEY\",\"message\":\"Idempotency-Key header is required\",\"fieldErrors\":[]}")
                            })),
            @ApiResponse(
                    responseCode = "409",
                    description = "Idempotency key reused with a different payload",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ApiErrorResponse.class),
                            examples = @ExampleObject(
                                    name = "idempotencyConflict",
                                    value = "{\"code\":\"IDEMPOTENCY_KEY_REUSED\",\"message\":\"Idempotency-Key was already used with a different request payload\",\"fieldErrors\":[]}")))
    })
    public ResponseEntity<?> createPayment(
            @Parameter(
                    in = ParameterIn.HEADER,
                    name = "Idempotency-Key",
                    required = true,
                    description = "Unique client-provided key used to deduplicate payment creation requests",
                    example = "payment-create-001")
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    description = "Payment creation payload",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = CreatePaymentRequest.class),
                            examples = @ExampleObject(
                                    name = "createPaymentRequest",
                                    value = "{\"firstName\":\"Ada\",\"lastName\":\"Lovelace\",\"expiry\":\"12/29\",\"cvv\":\"123\",\"cardNumber\":\"123456789012\",\"invoiceIds\":[\"INV-2025-008\",\"INV-2025-007\"]}")))
            @Valid @RequestBody CreatePaymentRequest request) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            throw new MissingIdempotencyKeyException();
        }

        PaymentServiceResult result = paymentService.createPayment(idempotencyKey, request);
        return ResponseEntity.status(result.httpStatus()).body(result.response());
    }
}
