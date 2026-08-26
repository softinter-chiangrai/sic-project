package dev.suksabai.report_service.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.security")
public class SecurityProperties {

	@Valid
	private final RememberMe rememberMe = new RememberMe();

	public RememberMe getRememberMe() {
		return rememberMe;
	}

	public static class RememberMe {

		@Min(1)
		private int days = 30;

		@NotBlank
		private String key = "report-service-remember-me";

		public int getDays() {
			return days;
		}

		public void setDays(int days) {
			this.days = days;
		}

		public String getKey() {
			return key;
		}

		public void setKey(String key) {
			this.key = key;
		}
	}
}