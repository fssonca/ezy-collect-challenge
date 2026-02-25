package com.ezycollect.server.payments.domain;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentIdempotencyRepository extends JpaRepository<PaymentIdempotencyEntity, String> {
}

