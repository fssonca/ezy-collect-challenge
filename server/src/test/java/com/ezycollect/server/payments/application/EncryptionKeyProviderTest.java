package com.ezycollect.server.payments.application;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.ezycollect.server.payments.application.security.EncryptionKeyProvider;
import org.junit.jupiter.api.Test;

class EncryptionKeyProviderTest {

    @Test
    void invalidBase64KeyFailsWithClearMessage() {
        assertThatThrownBy(() -> new EncryptionKeyProvider("not-base64"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("must be valid base64");
    }
}

