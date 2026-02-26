package com.ezycollect.server.payments.application.dto;

import com.ezycollect.server.payments.application.validation.ValidExpiry;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.Getter;

@Getter
@Schema(name = "CreatePaymentRequest", description = "Payment creation request")
public class CreatePaymentRequest {

    @Schema(
            description = "Payer first name (trimmed)",
            minLength = 1,
            maxLength = 100,
            example = "Ada")
    @NotBlank(message = "firstName is required")
    @Size(min = 1, max = 100, message = "firstName must be between 1 and 100 characters")
    private String firstName;

    @Schema(
            description = "Payer last name (trimmed)",
            minLength = 1,
            maxLength = 100,
            example = "Lovelace")
    @NotBlank(message = "lastName is required")
    @Size(min = 1, max = 100, message = "lastName must be between 1 and 100 characters")
    private String lastName;

    @Schema(
            description = "Card expiry in MM/YY format",
            pattern = "^(0[1-9]|1[0-2])/\\d{2}$",
            example = "12/29")
    @NotBlank(message = "expiry is required")
    @ValidExpiry
    private String expiry;

    @Schema(
            description = "Card security code (3 or 4 digits)",
            pattern = "^\\d{3,4}$",
            minLength = 3,
            maxLength = 4,
            example = "123")
    @NotBlank(message = "cvv is required")
    @Pattern(regexp = "\\d+", message = "cvv must contain only digits")
    @Size(min = 3, max = 4, message = "cvv must be 3 or 4 digits")
    private String cvv;

    @Schema(
            description = "Primary account number (digits only, 12-19 digits)",
            pattern = "^\\d{12,19}$",
            minLength = 12,
            maxLength = 19,
            example = "123456789012")
    @NotBlank(message = "cardNumber is required")
    @Pattern(regexp = "\\d+", message = "cardNumber must contain only digits")
    @Size(min = 12, max = 19, message = "cardNumber must be between 12 and 19 digits")
    private String cardNumber;

    @NotEmpty(message = "invoiceIds is required")
    @ArraySchema(
            arraySchema = @Schema(description = "Invoice IDs to be paid in this payment request"),
            schema = @Schema(example = "INV-2025-008"))
    private List<
            @NotBlank(message = "invoiceIds entries must not be blank")
            @Size(max = 100, message = "invoiceIds entries must be at most 100 characters")
            String> invoiceIds;

    public void setFirstName(String firstName) {
        this.firstName = trim(firstName);
    }

    public void setLastName(String lastName) {
        this.lastName = trim(lastName);
    }

    public void setExpiry(String expiry) {
        this.expiry = trim(expiry);
    }

    public void setCvv(String cvv) {
        this.cvv = trim(cvv);
    }

    public void setCardNumber(String cardNumber) {
        this.cardNumber = trim(cardNumber);
    }

    public void setInvoiceIds(List<String> invoiceIds) {
        if (invoiceIds == null) {
            this.invoiceIds = null;
            return;
        }
        this.invoiceIds = invoiceIds.stream()
                .map(this::trim)
                .toList();
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }
}
