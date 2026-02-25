package com.ezycollect.server.payments.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.ezycollect.server.payments.application.dto.CreatePaymentRequest;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest(properties = {
        "PAYMENTS_ENCRYPTION_KEY_B64=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY="
})
class PaymentEncryptionPersistenceTest {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void cardNumberIsStoredEncryptedAtRest() {
        String cardNumber = "4242424242424242";
        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setFirstName("Jane");
        request.setLastName("Doe");
        request.setExpiry("12/25");
        request.setCvv("123");
        request.setCardNumber(cardNumber);

        var response = paymentService.createPayment("idem-encryption-test", request);

        PaymentRow row = jdbcTemplate.queryForObject(
                "SELECT card_number_ciphertext, card_number_iv, card_last4 FROM payments WHERE id = ?",
                (rs, rowNum) -> new PaymentRow(
                        rs.getBytes("card_number_ciphertext"),
                        rs.getBytes("card_number_iv"),
                        rs.getString("card_last4")),
                response.response().id());

        assertThat(row).isNotNull();
        assertThat(row.ciphertext()).isNotNull().isNotEmpty();
        assertThat(row.iv()).isNotNull().hasSize(12);
        assertThat(row.last4()).isEqualTo("4242");
        assertThat(containsAsciiSequence(row.ciphertext(), cardNumber)).isFalse();
    }

    private boolean containsAsciiSequence(byte[] haystack, String plaintext) {
        byte[] needle = plaintext.getBytes(StandardCharsets.UTF_8);
        if (needle.length == 0 || haystack.length < needle.length) {
            return false;
        }
        for (int i = 0; i <= haystack.length - needle.length; i++) {
            boolean match = true;
            for (int j = 0; j < needle.length; j++) {
                if (haystack[i + j] != needle[j]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                return true;
            }
        }
        return false;
    }

    private record PaymentRow(byte[] ciphertext, byte[] iv, String last4) {
    }
}
