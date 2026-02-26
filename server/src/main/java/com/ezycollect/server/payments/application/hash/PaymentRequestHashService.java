package com.ezycollect.server.payments.application.hash;

import com.ezycollect.server.payments.application.dto.CreatePaymentRequest;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import java.util.List;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import org.springframework.stereotype.Component;

@Component
public class PaymentRequestHashService {

    private final ObjectMapper canonicalObjectMapper;

    public PaymentRequestHashService() {
        this.canonicalObjectMapper = new ObjectMapper()
                .configure(MapperFeature.SORT_PROPERTIES_ALPHABETICALLY, true)
                .configure(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS, true);
    }

    public String hash(CreatePaymentRequest request) {
        CanonicalPaymentRequest payload = new CanonicalPaymentRequest(
                request.getFirstName(),
                request.getLastName(),
                request.getExpiry(),
                request.getCvv(),
                request.getCardNumber(),
                request.getInvoiceIds() == null ? List.of() : List.copyOf(request.getInvoiceIds()));

        try {
            byte[] canonicalJson = canonicalObjectMapper.writeValueAsBytes(payload);
            return sha256Hex(canonicalJson);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Failed to hash payment request", ex);
        }
    }

    private String sha256Hex(byte[] bytes) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(bytes);
            StringBuilder sb = new StringBuilder(digest.length * 2);
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 algorithm is unavailable", ex);
        }
    }

    private record CanonicalPaymentRequest(
            String firstName,
            String lastName,
            String expiry,
            String cvv,
            String cardNumber,
            List<String> invoiceIds
    ) {
    }
}
