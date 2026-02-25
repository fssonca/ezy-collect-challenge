package com.ezycollect.server.payments.application;

import com.ezycollect.server.payments.application.dto.CreatePaymentResponse;
import org.springframework.http.HttpStatus;

public record PaymentServiceResult(
        CreatePaymentResponse response,
        HttpStatus httpStatus
) {
}

