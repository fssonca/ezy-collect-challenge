package com.ezycollect.server.payments.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ezycollect.server.support.AbstractMySqlSpringBootIntegrationTest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class PaymentsIdempotencyIntegrationTest extends AbstractMySqlSpringBootIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void cleanTables() {
        jdbcTemplate.update("DELETE FROM payment_idempotency");
        jdbcTemplate.update("DELETE FROM payments");
    }

    @Test
    void idempotentReplayReturnsStoredResponseAndDoesNotCreateDuplicatePayment() throws Exception {
        String key = "idem-key-1";
        String payload = validPayload(" Jane ", " Doe ");

        MvcResult first = postPayment(key, payload)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.status").value("CREATED"))
                .andExpect(jsonPath("$.createdAt").exists())
                .andReturn();

        assertThat(countRows("payments")).isEqualTo(1);
        assertThat(countRows("payment_idempotency")).isEqualTo(1);

        MvcResult replay = postPayment(key, payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.status").value("CREATED"))
                .andExpect(jsonPath("$.createdAt").exists())
                .andReturn();

        JsonNode firstJson = objectMapper.readTree(first.getResponse().getContentAsString());
        JsonNode replayJson = objectMapper.readTree(replay.getResponse().getContentAsString());
        assertThat(replayJson).isEqualTo(firstJson);
        assertThat(countRows("payments")).isEqualTo(1);
        assertThat(countRows("payment_idempotency")).isEqualTo(1);

        IdempotencyRow row = loadIdempotencyRow(key);
        assertThat(row).isNotNull();
        assertThat(row.requestHash()).hasSize(64).matches("[a-f0-9]{64}");
        assertThat(row.paymentId()).isEqualTo(firstJson.get("id").asText());
        assertThat(row.responseStatus()).isEqualTo(201);
        JsonNode storedResponse = objectMapper.readTree(row.responseBody());
        assertThat(storedResponse).isEqualTo(firstJson);
        assertThat(storedResponse.has("cardNumber")).isFalse();
        assertThat(storedResponse.has("cvv")).isFalse();
        assertThat(storedResponse.has("expiry")).isFalse();
        assertThat(row.createdAt()).isNotNull();
        assertThat(row.updatedAt()).isNotNull();
    }

    @Test
    void idempotencyMismatchReturnsConflictAndDoesNotCreateDuplicatePayment() throws Exception {
        String key = "idem-key-2";

        postPayment(key, validPayload("Jane", "Doe"))
                .andExpect(status().isCreated());

        postPayment(key, validPayload("Jane", "Smith"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("IDEMPOTENCY_KEY_REUSED"))
                .andExpect(jsonPath("$.message")
                        .value("Idempotency-Key was already used with a different request payload"));

        assertThat(countRows("payments")).isEqualTo(1);
        assertThat(countRows("payment_idempotency")).isEqualTo(1);
    }

    private org.springframework.test.web.servlet.ResultActions postPayment(String key, String payload) throws Exception {
        return mockMvc.perform(post("/payments")
                .contentType(APPLICATION_JSON)
                .header("Idempotency-Key", key)
                .content(payload));
    }

    private String validPayload(String firstName, String lastName) {
        return """
                {
                  "firstName":"%s",
                  "lastName":"%s",
                  "expiry":"12/25",
                  "cvv":"123",
                  "cardNumber":"4242424242424242"
                }
                """.formatted(firstName, lastName);
    }

    private int countRows(String tableName) {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + tableName, Integer.class);
        return count == null ? 0 : count;
    }

    private IdempotencyRow loadIdempotencyRow(String key) {
        return jdbcTemplate.queryForObject(
                """
                SELECT idempotency_key, request_hash, payment_id, response_status, response_body, created_at, updated_at
                FROM payment_idempotency
                WHERE idempotency_key = ?
                """,
                (rs, rowNum) -> new IdempotencyRow(
                        rs.getString("idempotency_key"),
                        rs.getString("request_hash"),
                        rs.getString("payment_id"),
                        rs.getInt("response_status"),
                        rs.getString("response_body"),
                        rs.getTimestamp("created_at").toInstant(),
                        rs.getTimestamp("updated_at").toInstant()),
                key);
    }

    private record IdempotencyRow(
            String key,
            String requestHash,
            String paymentId,
            int responseStatus,
            String responseBody,
            Instant createdAt,
            Instant updatedAt
    ) {
    }
}
