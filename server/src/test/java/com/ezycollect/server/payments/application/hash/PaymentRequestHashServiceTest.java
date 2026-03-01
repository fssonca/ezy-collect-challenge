package com.ezycollect.server.payments.application.hash;

import static org.assertj.core.api.Assertions.assertThat;

import com.ezycollect.server.payments.application.dto.CreatePaymentRequest;
import java.util.List;
import org.junit.jupiter.api.Test;

class PaymentRequestHashServiceTest {

    private final PaymentRequestHashService paymentRequestHashService = new PaymentRequestHashService();

    @Test
    void hashIsOrderInsensitiveForInvoiceIds() {
        CreatePaymentRequest r1 = baseRequest();
        r1.setInvoiceIds(List.of("INV-2", "INV-1"));

        CreatePaymentRequest r2 = baseRequest();
        r2.setInvoiceIds(List.of("INV-1", "INV-2"));

        assertThat(paymentRequestHashService.hash(r1)).isEqualTo(paymentRequestHashService.hash(r2));
    }

    @Test
    void hashDoesNotDependOnCvv() {
        CreatePaymentRequest r1 = baseRequest();
        r1.setCvv("123");

        CreatePaymentRequest r2 = baseRequest();
        r2.setCvv("999");

        assertThat(paymentRequestHashService.hash(r1)).isEqualTo(paymentRequestHashService.hash(r2));
    }

    @Test
    void hashDependsOnlyOnCardLast4NotFullCardNumber() {
        CreatePaymentRequest r1 = baseRequest();
        r1.setCardNumber("123456789012");

        CreatePaymentRequest r2 = baseRequest();
        r2.setCardNumber("999956789012");

        assertThat(paymentRequestHashService.hash(r1)).isEqualTo(paymentRequestHashService.hash(r2));
    }

    @Test
    void hashChangesWhenCardLast4Changes() {
        CreatePaymentRequest r1 = baseRequest();
        r1.setCardNumber("123456789012");

        CreatePaymentRequest r2 = baseRequest();
        r2.setCardNumber("123456789099");

        assertThat(paymentRequestHashService.hash(r1)).isNotEqualTo(paymentRequestHashService.hash(r2));
    }

    private CreatePaymentRequest baseRequest() {
        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setFirstName("Ada");
        request.setLastName("Lovelace");
        request.setExpiry("12/29");
        request.setCvv("123");
        request.setCardNumber("123456789012");
        request.setInvoiceIds(List.of("INV-1"));
        return request;
    }
}
