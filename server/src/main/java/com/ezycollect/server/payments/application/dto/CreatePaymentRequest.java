package com.ezycollect.server.payments.application.dto;

import com.ezycollect.server.payments.application.validation.ValidExpiry;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class CreatePaymentRequest {

    @NotBlank(message = "firstName is required")
    @Size(min = 1, max = 100, message = "firstName must be between 1 and 100 characters")
    private String firstName;

    @NotBlank(message = "lastName is required")
    @Size(min = 1, max = 100, message = "lastName must be between 1 and 100 characters")
    private String lastName;

    @NotBlank(message = "expiry is required")
    @ValidExpiry
    private String expiry;

    @NotBlank(message = "cvv is required")
    @Pattern(regexp = "\\d+", message = "cvv must contain only digits")
    @Size(min = 3, max = 4, message = "cvv must be 3 or 4 digits")
    private String cvv;

    @NotBlank(message = "cardNumber is required")
    @Pattern(regexp = "\\d+", message = "cardNumber must contain only digits")
    @Size(min = 12, max = 19, message = "cardNumber must be between 12 and 19 digits")
    private String cardNumber;

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

    private String trim(String value) {
        return value == null ? null : value.trim();
    }
}
