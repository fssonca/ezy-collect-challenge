package com.ezycollect.server.payments.application.hash;

import com.ezycollect.server.payments.application.dto.CreatePaymentRequest;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class PaymentRequestHashService {

    private final ObjectMapper canonicalObjectMapper;

    public PaymentRequestHashService() {
        this.canonicalObjectMapper = new ObjectMapper()
                .configure(MapperFeature.SORT_PROPERTIES_ALPHABETICALLY, true)
                .configure(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS, true);
    }

    /*
     * Idempotency hash strategy (challenge code note):
     * - In production payment systems you typically should NOT store or derive identifiers from raw PAN/CVV.
     * - A common pattern is to bind idempotency to the payment provider's token/fingerprint (e.g., a card token,
     *   payment method id, or provider-provided card fingerprint) plus business fields (invoice ids, amount, etc.).
     * - This codebase is a challenge/sample, so we use a simpler approach: we exclude CVV entirely, use only
     *   card last4, and normalize invoiceIds ordering to keep hashes stable across retries.
     */
    public String hash(CreatePaymentRequest request) {
        CanonicalPaymentRequest payload = new CanonicalPaymentRequest(
                request.getFirstName(),
                request.getLastName(),
                request.getExpiry(),
                last4(request.getCardNumber()),
                normalizeInvoiceIds(request.getInvoiceIds()));

        try {
            byte[] canonicalJson = canonicalObjectMapper.writeValueAsBytes(payload);
            return sha256Hex(canonicalJson);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Failed to hash payment request", ex);
        }
    }

    private List<String> normalizeInvoiceIds(List<String> invoiceIds) {
        if (invoiceIds == null) {
            return List.of();
        }
        return invoiceIds.stream()
                .sorted()
                .toList();
    }

    private String last4(String cardNumber) {
        if (cardNumber == null) {
            return null;
        }
        int length = cardNumber.length();
        return cardNumber.substring(Math.max(0, length - 4));
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
            String cardLast4,
            List<String> invoiceIds
    ) {
    }
}
