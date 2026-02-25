package com.ezycollect.server.payments.domain;

import java.sql.Timestamp;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class PaymentIdempotencyClaimRepository {

    private final JdbcTemplate jdbcTemplate;

    public void insertClaim(String idempotencyKey, String requestHash, Instant now) {
        jdbcTemplate.update(
                """
                INSERT INTO payment_idempotency (
                  idempotency_key, request_hash, created_at, updated_at
                ) VALUES (?, ?, ?, ?)
                """,
                idempotencyKey,
                requestHash,
                Timestamp.from(now),
                Timestamp.from(now));
    }
}

