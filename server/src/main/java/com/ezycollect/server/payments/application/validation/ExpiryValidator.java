package com.ezycollect.server.payments.application.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ExpiryValidator implements ConstraintValidator<ValidExpiry, String> {

    private static final Pattern EXPIRY_PATTERN = Pattern.compile("^(\\d{2})/(\\d{2})$");

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) {
            return true;
        }

        Matcher matcher = EXPIRY_PATTERN.matcher(value);
        if (!matcher.matches()) {
            return false;
        }

        int month = Integer.parseInt(matcher.group(1));
        return month >= 1 && month <= 12;
    }
}

