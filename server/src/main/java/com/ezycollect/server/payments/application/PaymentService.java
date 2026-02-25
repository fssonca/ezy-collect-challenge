package com.ezycollect.server.payments.application;

import com.ezycollect.server.payments.application.error.IdempotencyConflictException;
import com.ezycollect.server.payments.application.dto.CreatePaymentRequest;
import com.ezycollect.server.payments.application.dto.CreatePaymentResponse;
import com.ezycollect.server.payments.application.hash.PaymentRequestHashService;
import com.ezycollect.server.payments.application.security.AesGcmCrypto;
import com.ezycollect.server.payments.application.security.EncryptedPayload;
import com.ezycollect.server.payments.domain.PaymentEntity;
import com.ezycollect.server.payments.domain.PaymentIdempotencyClaimRepository;
import com.ezycollect.server.payments.domain.PaymentIdempotencyEntity;
import com.ezycollect.server.payments.domain.PaymentIdempotencyRepository;
import com.ezycollect.server.payments.domain.PaymentRepository;
import com.ezycollect.server.payments.domain.PaymentStatus;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentIdempotencyClaimRepository paymentIdempotencyClaimRepository;
    private final PaymentIdempotencyRepository paymentIdempotencyRepository;
    private final AesGcmCrypto aesGcmCrypto;
    private final PaymentRequestHashService paymentRequestHashService;
    private final ObjectMapper objectMapper;

    @Transactional
    public PaymentServiceResult createPayment(String idempotencyKey, CreatePaymentRequest request) {
        String requestHash = paymentRequestHashService.hash(request);
        Instant now = Instant.now();

        PaymentIdempotencyEntity idempotency = new PaymentIdempotencyEntity();
        idempotency.setIdempotencyKey(idempotencyKey);
        idempotency.setRequestHash(requestHash);
        idempotency.setCreatedAt(now);
        idempotency.setUpdatedAt(now);
        try {
            paymentIdempotencyClaimRepository.insertClaim(idempotencyKey, requestHash, now);
        } catch (DuplicateKeyException ex) {
            return handleExistingIdempotency(idempotencyKey, requestHash);
        }

        String id = UUID.randomUUID().toString();

        PaymentEntity entity = new PaymentEntity();
        entity.setId(id);
        entity.setFirstName(request.getFirstName());
        entity.setLastName(request.getLastName());
        entity.setCardLast4(last4(request.getCardNumber()));
        EncryptedPayload encryptedCardNumber = aesGcmCrypto.encrypt(request.getCardNumber());
        entity.setCardNumberCiphertext(encryptedCardNumber.ciphertext());
        entity.setCardNumberIv(encryptedCardNumber.iv());
        entity.setStatus(PaymentStatus.CREATED);
        entity.setCreatedAt(now);
        // TODO: store encrypted expiry in a dedicated column in a future phase if required.
        paymentRepository.save(entity);

        CreatePaymentResponse response = new CreatePaymentResponse(id, PaymentStatus.CREATED.name(), now);
        idempotency.setPaymentId(id);
        idempotency.setResponseStatus(HttpStatus.CREATED.value());
        idempotency.setResponseBody(serializeResponse(response));
        idempotency.setUpdatedAt(Instant.now());
        paymentIdempotencyRepository.save(idempotency);

        return new PaymentServiceResult(response, HttpStatus.CREATED);
    }

    private String last4(String cardNumber) {
        int length = cardNumber.length();
        return cardNumber.substring(Math.max(0, length - 4));
    }

    private PaymentServiceResult handleExistingIdempotency(String idempotencyKey, String requestHash) {
        PaymentIdempotencyEntity existing = paymentIdempotencyRepository.findById(idempotencyKey)
                .orElseThrow(() -> new IllegalStateException("Idempotency record lookup failed after duplicate key"));

        if (!existing.getRequestHash().equals(requestHash)) {
            throw new IdempotencyConflictException();
        }

        if (existing.getResponseBody() == null || existing.getResponseStatus() == null) {
            throw new IllegalStateException("Idempotency request is already in progress");
        }

        CreatePaymentResponse response = deserializeResponse(existing.getResponseBody());
        return new PaymentServiceResult(response, HttpStatus.OK);
    }

    private String serializeResponse(CreatePaymentResponse response) {
        try {
            return objectMapper.writeValueAsString(response);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Failed to serialize payment response", ex);
        }
    }

    private CreatePaymentResponse deserializeResponse(String responseBody) {
        try {
            return objectMapper.readValue(responseBody, CreatePaymentResponse.class);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Failed to deserialize stored idempotency response", ex);
        }
    }
}
