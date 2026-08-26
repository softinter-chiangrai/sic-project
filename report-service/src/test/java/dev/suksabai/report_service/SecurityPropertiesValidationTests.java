package dev.suksabai.report_service;

import dev.suksabai.report_service.config.SecurityProperties;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.context.ConfigurationPropertiesAutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.boot.validation.autoconfigure.ValidationAutoConfiguration;
import org.springframework.context.annotation.Configuration;

import static org.assertj.core.api.Assertions.assertThat;

class SecurityPropertiesValidationTests {

	private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
		.withConfiguration(org.springframework.boot.autoconfigure.AutoConfigurations.of(
			ConfigurationPropertiesAutoConfiguration.class,
			ValidationAutoConfiguration.class
		))
		.withUserConfiguration(SecurityPropertiesTestConfiguration.class);

	@Test
	void shouldFailFastWhenRememberMeDaysIsZero() {
		contextRunner
			.withPropertyValues(
				"app.security.remember-me.days=0",
				"app.security.remember-me.key=test-key"
			)
			.run(context -> {
				assertThat(context).hasFailed();
				assertThat(context.getStartupFailure()).hasStackTraceContaining("rememberMe.days");
			});
	}

	@Test
	void shouldFailFastWhenRememberMeKeyIsBlank() {
		contextRunner
			.withPropertyValues(
				"app.security.remember-me.days=30",
				"app.security.remember-me.key="
			)
			.run(context -> {
				assertThat(context).hasFailed();
				assertThat(context.getStartupFailure()).hasStackTraceContaining("rememberMe.key");
			});
	}

	@Configuration
	@EnableConfigurationProperties(SecurityProperties.class)
	static class SecurityPropertiesTestConfiguration {
	}
}