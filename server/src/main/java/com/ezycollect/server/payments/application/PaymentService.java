package com.ezycollect.server.payments.application;

import com.ezycollect.server.payments.application.dto.CreatePaymentRequest;
import com.ezycollect.server.payments.application.dto.CreatePaymentResponse;
import com.ezycollect.server.payments.application.security.AesGcmCrypto;
import com.ezycollect.server.payments.application.security.EncryptedPayload;
import com.ezycollect.server.payments.domain.PaymentEntity;
import com.ezycollect.server.payments.domain.PaymentRepository;
import com.ezycollect.server.payments.domain.PaymentStatus;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final AesGcmCrypto aesGcmCrypto;

    @Transactional
    public CreatePaymentResponse createPayment(String idempotencyKey, CreatePaymentRequest request) {
        // TODO: use idempotencyKey for deduplication workflow in the next phase.
        String id = UUID.randomUUID().toString();
        Instant now = Instant.now();

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

        return new CreatePaymentResponse(id, PaymentStatus.CREATED.name(), now);
    }

    private String last4(String cardNumber) {
        int length = cardNumber.length();
        return cardNumber.substring(Math.max(0, length - 4));
    }
}
