package com.ezycollect.server.payments.api;

import com.ezycollect.server.payments.application.PaymentService;
import com.ezycollect.server.payments.application.dto.CreatePaymentRequest;
import com.ezycollect.server.payments.application.dto.CreatePaymentResponse;
import com.ezycollect.server.payments.application.error.MissingIdempotencyKeyException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
public class PaymentsController {

    private final PaymentService paymentService;

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CreatePaymentResponse> createPayment(
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @Valid @RequestBody CreatePaymentRequest request) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            throw new MissingIdempotencyKeyException();
        }

        CreatePaymentResponse response = paymentService.createPayment(idempotencyKey, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
