package dev.suksabai.report_service.service;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.assertj.core.api.Assertions.assertThat;

class DownloadUrlServiceTests {

	@Test
	void buildShouldUseConfiguredBaseUrlWhenPresent() {
		SystemSettingsService systemSettingsService = Mockito.mock(SystemSettingsService.class);
		Mockito.when(systemSettingsService.getDownloadBaseUrl()).thenReturn("https://report-service.domain.com/");
		DownloadUrlService service = new DownloadUrlService(systemSettingsService);

		String url = service.build(null, "/api/reports/files/{id}/download", 42L);

		assertThat(url).isEqualTo("https://report-service.domain.com/api/reports/files/42/download");
	}

	@Test
	void buildShouldUseCurrentRequestContextWhenBaseUrlIsBlank() {
		SystemSettingsService systemSettingsService = Mockito.mock(SystemSettingsService.class);
		Mockito.when(systemSettingsService.getDownloadBaseUrl()).thenReturn("   ");
		DownloadUrlService service = new DownloadUrlService(systemSettingsService);
		MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/reports/generate");
		request.setScheme("https");
		request.setServerName("fallback-report-service.example.com");
		request.setServerPort(443);
		request.setContextPath("/report-service");

		String url = service.build(request, "/api/reports/files/{id}/download", 42L);

		assertThat(url).isEqualTo("https://fallback-report-service.example.com/report-service/api/reports/files/42/download");
	}
}