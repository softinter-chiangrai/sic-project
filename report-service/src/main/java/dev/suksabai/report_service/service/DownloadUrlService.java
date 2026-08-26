package dev.suksabai.report_service.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class DownloadUrlService {

	private final SystemSettingsService systemSettingsService;

	public DownloadUrlService(SystemSettingsService systemSettingsService) {
		this.systemSettingsService = systemSettingsService;
	}

	public String build(HttpServletRequest request, String pathTemplate, Object... uriVariables) {
		String configuredBaseUrl = normalizeBaseUrl(systemSettingsService.getDownloadBaseUrl());
		String normalizedPathTemplate = normalizePathTemplate(pathTemplate);
		UriComponentsBuilder uriBuilder = hasConfiguredBaseUrl(configuredBaseUrl)
			? UriComponentsBuilder.fromUriString(configuredBaseUrl)
			: ServletUriComponentsBuilder.fromContextPath(requireRequest(request));
		return uriBuilder.path(normalizedPathTemplate)
			.buildAndExpand(uriVariables)
			.toUriString();
	}

	private boolean hasConfiguredBaseUrl(String configuredBaseUrl) {
		return !configuredBaseUrl.isEmpty();
	}

	private HttpServletRequest requireRequest(HttpServletRequest request) {
		if (request == null) {
			throw new IllegalArgumentException("HttpServletRequest is required when app.download.base-url is not configured.");
		}
		return request;
	}

	private String normalizeBaseUrl(String baseUrl) {
		if (baseUrl == null) {
			return "";
		}

		String normalized = baseUrl.trim();
		while (normalized.endsWith("/")) {
			normalized = normalized.substring(0, normalized.length() - 1);
		}
		return normalized;
	}

	private String normalizePathTemplate(String pathTemplate) {
		if (pathTemplate == null || pathTemplate.isBlank()) {
			throw new IllegalArgumentException("Download path template is required.");
		}

		String normalized = pathTemplate.trim();
		return normalized.startsWith("/") ? normalized : "/" + normalized;
	}
}