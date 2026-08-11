package com.payments.server.payments.application;

import com.payments.server.payments.application.dto.CreatePaymentResponse;
import org.springframework.http.HttpStatus;

public record PaymentServiceResult(
        CreatePaymentResponse response,
        HttpStatus httpStatus
) {
}

