package dev.suksabai.report_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;

@Service
public class WebhookDeliveryService {

	private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
	private final HttpClient httpClient;
	private final Duration requestTimeout;

	public WebhookDeliveryService(
		@Value("${app.queue.webhook.connect-timeout-ms:5000}") long connectTimeoutMs,
		@Value("${app.queue.webhook.request-timeout-ms:10000}") long requestTimeoutMs
	) {
		this.httpClient = HttpClient.newBuilder()
			.connectTimeout(Duration.ofMillis(connectTimeoutMs))
			.build();
		this.requestTimeout = Duration.ofMillis(requestTimeoutMs);
	}

	public WebhookDeliveryResult deliver(String url, Map<String, Object> payload) {
		try {
			String jsonBody = objectMapper.writeValueAsString(payload);
			HttpRequest request = HttpRequest.newBuilder()
				.uri(URI.create(url))
				.timeout(requestTimeout)
				.header("Content-Type", "application/json")
				.POST(HttpRequest.BodyPublishers.ofString(jsonBody))
				.build();

			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
			boolean success = response.statusCode() >= 200 && response.statusCode() < 300;
			return new WebhookDeliveryResult(success, response.statusCode(), "HTTP " + response.statusCode());
		} catch (IOException exception) {
			return new WebhookDeliveryResult(false, null, sanitizeMessage(exception));
		} catch (InterruptedException exception) {
			Thread.currentThread().interrupt();
			return new WebhookDeliveryResult(false, null, "Webhook delivery was interrupted.");
		} catch (RuntimeException exception) {
			return new WebhookDeliveryResult(false, null, sanitizeMessage(exception));
		}
	}

	private String sanitizeMessage(Exception exception) {
		String message = exception.getMessage();
		if (message == null || message.isBlank()) {
			message = exception.getClass().getSimpleName();
		}

		String normalized = message.replaceAll("\\s+", " ").trim();
		return normalized.length() > 180 ? normalized.substring(0, 177) + "..." : normalized;
	}

	public record WebhookDeliveryResult(
		boolean success,
		Integer httpStatus,
		String message
	) {
	}
}
