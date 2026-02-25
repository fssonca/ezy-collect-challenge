package com.ezycollect.server.payments.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest(properties = {
        "PAYMENTS_ENCRYPTION_KEY_B64=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY="
})
@AutoConfigureMockMvc
class PaymentsIdempotencyIntegrationTest {

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
    void firstReplayAndMismatchBehaveAsExpected() throws Exception {
        String key = "idem-key-1";
        String payload = """
                {
                  "firstName":" Jane ",
                  "lastName":" Doe ",
                  "expiry":"12/25",
                  "cvv":"123",
                  "cardNumber":"4242424242424242"
                }
                """;
        String payloadDifferent = """
                {
                  "firstName":" Jane ",
                  "lastName":" Smith ",
                  "expiry":"12/25",
                  "cvv":"123",
                  "cardNumber":"4242424242424242"
                }
                """;

        MvcResult first = mockMvc.perform(post("/payments")
                        .contentType(APPLICATION_JSON)
                        .header("Idempotency-Key", key)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.status").value("CREATED"))
                .andExpect(jsonPath("$.createdAt").exists())
                .andReturn();

        assertThat(countRows("payments")).isEqualTo(1);

        MvcResult replay = mockMvc.perform(post("/payments")
                        .contentType(APPLICATION_JSON)
                        .header("Idempotency-Key", key)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.status").value("CREATED"))
                .andExpect(jsonPath("$.createdAt").exists())
                .andReturn();

        JsonNode firstJson = objectMapper.readTree(first.getResponse().getContentAsString());
        JsonNode replayJson = objectMapper.readTree(replay.getResponse().getContentAsString());
        assertThat(replayJson).isEqualTo(firstJson);
        assertThat(countRows("payments")).isEqualTo(1);

        mockMvc.perform(post("/payments")
                        .contentType(APPLICATION_JSON)
                        .header("Idempotency-Key", key)
                        .content(payloadDifferent))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("IDEMPOTENCY_KEY_REUSED"))
                .andExpect(jsonPath("$.message")
                        .value("Idempotency-Key was already used with a different request payload"));

        assertThat(countRows("payments")).isEqualTo(1);
    }

    private int countRows(String tableName) {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + tableName, Integer.class);
        return count == null ? 0 : count;
    }
}
