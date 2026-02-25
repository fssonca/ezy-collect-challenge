package com.ezycollect.server.payments.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.ezycollect.server.payments.application.security.EncryptionKeyProvider;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

class EncryptionKeyProviderContextFailureTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withBean(EncryptionKeyProvider.class);

    @Test
    void invalidLengthKeyFailsContextStartupWithClearMessage() {
        contextRunner
                .withPropertyValues("PAYMENTS_ENCRYPTION_KEY_B64=YWFh")
                .run(context -> {
                    assertThat(context).hasFailed();
                    assertThat(context.getStartupFailure()).hasRootCauseInstanceOf(IllegalStateException.class);
                    assertThat(context.getStartupFailure())
                            .hasRootCauseMessage("PAYMENTS_ENCRYPTION_KEY_B64 must decode to exactly 32 bytes (256-bit key)");
                });
    }
}
