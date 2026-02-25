package com.ezycollect.server.payments.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "payment_idempotency")
@Getter
@Setter
public class PaymentIdempotencyEntity {

    @Id
    @Column(name = "idempotency_key", nullable = false, length = 255, updatable = false)
    private String idempotencyKey;

    @Column(name = "request_hash", nullable = false, length = 64)
    private String requestHash;

    @Column(name = "payment_id", length = 36)
    private String paymentId;

    @Column(name = "response_status")
    private Integer responseStatus;

    @Lob
    @Column(name = "response_body")
    private String responseBody;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;
}

