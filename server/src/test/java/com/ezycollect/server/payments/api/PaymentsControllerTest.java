package com.ezycollect.server.payments.api;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ezycollect.server.payments.application.PaymentService;
import com.ezycollect.server.payments.application.PaymentServiceResult;
import com.ezycollect.server.payments.application.dto.CreatePaymentResponse;
import com.ezycollect.server.shared.api.ApiExceptionHandler;
import com.ezycollect.server.shared.config.WebCorsConfig;
import java.time.Instant;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(PaymentsController.class)
@Import({ApiExceptionHandler.class, WebCorsConfig.class})
class PaymentsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PaymentService paymentService;

    @Test
    void preflightRequestReturnsCorsHeadersForFrontendOrigin() throws Exception {
        mockMvc.perform(options("/payments")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type,idempotency-key"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
                .andExpect(header().string("Vary", containsString("Origin")));

        verifyNoInteractions(paymentService);
    }

    @Test
    void validRequestReturnsCreatedWithoutSensitiveFields() throws Exception {
        Instant createdAt = Instant.parse("2026-02-24T12:00:00Z");
        given(paymentService.createPayment(eq("idem-123"), any()))
                .willReturn(new PaymentServiceResult(
                        new CreatePaymentResponse("550e8400-e29b-41d4-a716-446655440000", "CREATED", createdAt),
                        CREATED));

        mockMvc.perform(post("/payments")
                        .contentType(APPLICATION_JSON)
                        .header("Idempotency-Key", "idem-123")
                        .content(validRequestJson()))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value("550e8400-e29b-41d4-a716-446655440000"))
                .andExpect(jsonPath("$.status").value("CREATED"))
                .andExpect(jsonPath("$.createdAt").value("2026-02-24T12:00:00Z"))
                .andExpect(jsonPath("$.cardNumber").doesNotExist())
                .andExpect(jsonPath("$.cvv").doesNotExist())
                .andExpect(jsonPath("$.expiry").doesNotExist())
                .andExpect(jsonPath("$.firstName").doesNotExist())
                .andExpect(jsonPath("$.lastName").doesNotExist());
    }

    @Test
    void missingIdempotencyKeyReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/payments")
                        .contentType(APPLICATION_JSON)
                        .content(validRequestJson()))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value("MISSING_IDEMPOTENCY_KEY"))
                .andExpect(jsonPath("$.message").value("Idempotency-Key header is required"))
                .andExpect(jsonPath("$.fieldErrors").isArray())
                .andExpect(jsonPath("$").isMap())
                .andExpect(content().string(not(containsString("cardNumber"))))
                .andExpect(content().string(not(containsString("cvv"))))
                .andExpect(content().string(not(containsString("expiry"))));

        verifyNoInteractions(paymentService);
    }

    @Test
    void blankIdempotencyKeyReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/payments")
                        .contentType(APPLICATION_JSON)
                        .header("Idempotency-Key", "   ")
                        .content(validRequestJson()))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value("MISSING_IDEMPOTENCY_KEY"))
                .andExpect(jsonPath("$.message").value("Idempotency-Key header is required"));

        verifyNoInteractions(paymentService);
    }

    @Test
    void invalidExpiryReturnsFieldError() throws Exception {
        mockMvc.perform(post("/payments")
                        .contentType(APPLICATION_JSON)
                        .header("Idempotency-Key", "idem-123")
                        .content("""
                                {
                                  "firstName":"Jane",
                                  "lastName":"Doe",
                                  "expiry":"13/25",
                                  "cvv":"123",
                                  "cardNumber":"424242424242",
                                  "invoiceIds":["INV-2025-002"]
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(content().contentTypeCompatibleWith(APPLICATION_JSON))
                .andExpect(jsonPath("$.fieldErrors[*].field", hasItem("expiry")))
                .andExpect(content().string(not(containsString("424242424242"))));

        verifyNoInteractions(paymentService);
    }

    @Test
    void nonDigitCardNumberReturnsFieldError() throws Exception {
        mockMvc.perform(post("/payments")
                        .contentType(APPLICATION_JSON)
                        .header("Idempotency-Key", "idem-123")
                        .content("""
                                {
                                  "firstName":"Jane",
                                  "lastName":"Doe",
                                  "expiry":"12/25",
                                  "cvv":"123",
                                  "cardNumber":"4242abcd4242",
                                  "invoiceIds":["INV-2025-002"]
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors[*].field", hasItem("cardNumber")));

        verifyNoInteractions(paymentService);
    }

    @Test
    void invalidCvvLengthReturnsFieldError() throws Exception {
        mockMvc.perform(post("/payments")
                        .contentType(APPLICATION_JSON)
                        .header("Idempotency-Key", "idem-123")
                        .content("""
                                {
                                  "firstName":"Jane",
                                  "lastName":"Doe",
                                  "expiry":"12/25",
                                  "cvv":"12",
                                  "cardNumber":"424242424242",
                                  "invoiceIds":["INV-2025-002"]
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors[*].field", hasItem("cvv")));

        verifyNoInteractions(paymentService);
    }

    @Test
    void missingInvoiceIdsReturnsValidationError() throws Exception {
        mockMvc.perform(post("/payments")
                        .contentType(APPLICATION_JSON)
                        .header("Idempotency-Key", "idem-123")
                        .content("""
                                {
                                  "firstName":"Jane",
                                  "lastName":"Doe",
                                  "expiry":"12/25",
                                  "cvv":"123",
                                  "cardNumber":"424242424242"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors[*].field", hasItem("invoiceIds")));

        verifyNoInteractions(paymentService);
    }

    @Test
    void emptyInvoiceIdsReturnsValidationError() throws Exception {
        mockMvc.perform(post("/payments")
                        .contentType(APPLICATION_JSON)
                        .header("Idempotency-Key", "idem-123")
                        .content("""
                                {
                                  "firstName":"Jane",
                                  "lastName":"Doe",
                                  "expiry":"12/25",
                                  "cvv":"123",
                                  "cardNumber":"424242424242",
                                  "invoiceIds":[]
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors[*].field", hasItem("invoiceIds")));

        verifyNoInteractions(paymentService);
    }

    @Test
    void blankInvoiceIdEntryReturnsValidationError() throws Exception {
        mockMvc.perform(post("/payments")
                        .contentType(APPLICATION_JSON)
                        .header("Idempotency-Key", "idem-123")
                        .content("""
                                {
                                  "firstName":"Jane",
                                  "lastName":"Doe",
                                  "expiry":"12/25",
                                  "cvv":"123",
                                  "cardNumber":"424242424242",
                                  "invoiceIds":["  "]
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors[*].field", hasItem("invoiceIds[0]")));

        verifyNoInteractions(paymentService);
    }

    @ParameterizedTest
    @MethodSource("blankNamePayloads")
    void blankNamesReturnValidationErrors(String payload, String fieldName) throws Exception {
        mockMvc.perform(post("/payments")
                        .contentType(APPLICATION_JSON)
                        .header("Idempotency-Key", "idem-123")
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors[*].field", hasItem(fieldName)))
                .andExpect(jsonPath("$.fieldErrors[0].message").exists());

        verifyNoInteractions(paymentService);
    }

    private static Stream<Arguments> blankNamePayloads() {
        return Stream.of(
                Arguments.of("""
                        {
                          "firstName":"   ",
                          "lastName":"Doe",
                          "expiry":"12/25",
                          "cvv":"123",
                          "cardNumber":"424242424242",
                          "invoiceIds":["INV-2025-002"]
                        }
                        """, "firstName"),
                Arguments.of("""
                        {
                          "firstName":"Jane",
                          "lastName":"   ",
                          "expiry":"12/25",
                          "cvv":"123",
                          "cardNumber":"424242424242",
                          "invoiceIds":["INV-2025-002"]
                        }
                        """, "lastName"));
    }

    private String validRequestJson() {
        return """
                {
                  "firstName":" Jane ",
                  "lastName":" Doe ",
                  "expiry":"12/25",
                  "cvv":"123",
                  "cardNumber":"424242424242",
                  "invoiceIds":["INV-2025-002","INV-2025-008"]
                }
                """;
    }
}
