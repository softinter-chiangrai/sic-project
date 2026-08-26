package dev.suksabai.report_service.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.suksabai.report_service.model.ReportGenerationQueueItem;
import dev.suksabai.report_service.repository.ReportGenerationQueueItemRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class ReportGenerationQueueService {

	private static final List<String> ACTIVE_WEBHOOK_STATUSES = List.of("Completed", "Failed");
	private static final String WEBHOOK_DELIVERED_EVENT = "Report Queue Webhook Delivered";
	private static final String WEBHOOK_FAILED_EVENT = "Report Queue Webhook Failed";

	private final ReportGenerationQueueItemRepository repository;
	private final ReportTemplateService reportTemplateService;
	private final GeneratedReportService generatedReportService;
	private final AuditLogService auditLogService;
	private final WebhookDeliveryService webhookDeliveryService;
	private final DownloadUrlService downloadUrlService;
	private final ConfiguredTimeDisplayService timeDisplayService;
	private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
	private final int batchSize;
	private final List<Duration> webhookRetryDelays;
	private final boolean queueProcessingEnabled;

	public ReportGenerationQueueService(
		ReportGenerationQueueItemRepository repository,
		ReportTemplateService reportTemplateService,
		GeneratedReportService generatedReportService,
		AuditLogService auditLogService,
		WebhookDeliveryService webhookDeliveryService,
		DownloadUrlService downloadUrlService,
		ConfiguredTimeDisplayService timeDisplayService,
		@Value("${app.queue.report-generation.batch-size:5}") int batchSize,
		@Value("${app.queue.webhook.retry-delays-minutes:1,5,15}") String webhookRetryDelaysMinutes,
		@Value("${app.queue.report-generation.enabled:true}") boolean queueProcessingEnabled
	) {
		this.repository = repository;
		this.reportTemplateService = reportTemplateService;
		this.generatedReportService = generatedReportService;
		this.auditLogService = auditLogService;
		this.webhookDeliveryService = webhookDeliveryService;
		this.downloadUrlService = downloadUrlService;
		this.timeDisplayService = timeDisplayService;
		this.batchSize = Math.max(1, batchSize);
		this.webhookRetryDelays = parseRetryDelays(webhookRetryDelaysMinutes);
		this.queueProcessingEnabled = queueProcessingEnabled;
	}

	@Transactional
	public QueueItemResponse enqueueFromApi(QueueGenerateRequest request, AccessTokenService.ApiAccessToken apiAccessToken) {
		return toResponse(enqueue(request, apiAccessToken == null ? null : apiAccessToken.id(), apiAccessToken == null ? null : apiAccessToken.tokenName()));
	}

	@Transactional
	public QueueItemResponse enqueueFromWeb(QueueGenerateRequest request, String username) {
		return toResponse(enqueue(request, null, username));
	}

	private ReportGenerationQueueItem enqueue(QueueGenerateRequest request, Long tokenId, String tokenName) {
		if (request == null || (request.reportId() == null && (request.templateCode() == null || request.templateCode().isBlank()))) {
			throw new IllegalArgumentException("Report id or template code is required.");
		}

		ReportTemplateService.TemplateRef templateRef = reportTemplateService.findTemplateSummary(request.reportId(), request.templateCode());
		String callbackUrl = normalizeCallbackUrl(request.callbackUrl());

		ReportGenerationQueueItem item = new ReportGenerationQueueItem();
		item.setReportTemplateId(templateRef.id());
		item.setReportTemplateName(templateRef.templateName());
		item.setParametersJson(writeParameters(request.parameters()));
		item.setOutputFormat(request.format() == null || request.format().isBlank() ? "pdf" : request.format().trim().toLowerCase(Locale.ROOT));
		item.setStatus("Queued");
		item.setRequestedByTokenId(tokenId);
		item.setRequestedByTokenName(resolveActor(tokenName));
		item.setCallbackUrl(callbackUrl);
		item.setWebhookStatus(callbackUrl == null ? "NotRequested" : "Pending");
		item = repository.save(item);

		auditLogService.logEvent(
			"Report Queued",
			"Queued report generation for template " + item.getReportTemplateName() + ".",
			item.getRequestedByTokenName(),
			item.getReportTemplateName(),
			"Completed"
		);

		return item;
	}

	@Transactional(readOnly = true)
	public QueueItemStatusResponse getStatus(long id, HttpServletRequest request) {
		ReportGenerationQueueItem item = repository.findById(id)
			.orElseThrow(() -> new QueueItemNotFoundException(id));
		return toStatusResponse(item, request);
	}

	@Transactional(readOnly = true)
	public QueueItemPageResult getPage(int page, int size, HttpServletRequest request) {
		int safePage = Math.max(page, 0);
		int safeSize = Math.max(1, Math.min(size, 50));
		ZoneId displayZoneId = timeDisplayService.currentDisplayZoneId();
		List<QueueItemStatusResponse> items = repository.findAllByOrderBySubmittedAtDesc().stream()
			.map(item -> toStatusResponse(item, request, displayZoneId))
			.toList();

		long totalItems = items.size();
		int totalPages = totalItems == 0 ? 0 : (int) Math.ceil((double) totalItems / safeSize);
		int resolvedPage = totalPages == 0 ? 0 : Math.min(safePage, totalPages - 1);
		int startIndex = Math.min(resolvedPage * safeSize, items.size());
		int endIndex = Math.min(startIndex + safeSize, items.size());

		PageImpl<QueueItemStatusResponse> itemPage = new PageImpl<>(
			items.subList(startIndex, endIndex),
			PageRequest.of(resolvedPage, safeSize),
			totalItems
		);

		return new QueueItemPageResult(
			itemPage.getContent(),
			itemPage.getTotalElements(),
			itemPage.getNumber(),
			itemPage.getSize(),
			itemPage.getTotalPages(),
			itemPage.hasPrevious(),
			itemPage.hasNext()
		);
	}

	@Transactional
	public QueueItemStatusResponse retryWebhookManually(long id, HttpServletRequest request) {
		ReportGenerationQueueItem item = repository.findById(id)
			.orElseThrow(() -> new QueueItemNotFoundException(id));
		if (item.getCallbackUrl() == null || item.getCallbackUrl().isBlank()) {
			throw new IllegalArgumentException("This queue item does not have a callback URL configured.");
		}

		item.setWebhookStatus("Pending");
		item.setWebhookAttempts(0);
		item.setNextWebhookAttemptAt(null);
		repository.save(item);
		attemptWebhookDeliveryIfDue(item);
		return toStatusResponse(item, request);
	}

	@Scheduled(fixedDelayString = "${app.queue.report-generation.poll-interval-ms:5000}")
	@Transactional
	public void processQueue() {
		if (!queueProcessingEnabled) {
			return;
		}

		List<ReportGenerationQueueItem> queuedItems = repository.findAllByStatusOrderBySubmittedAtAsc("Queued");
		queuedItems.stream().limit(batchSize).forEach(this::processQueueItem);
	}

	private void processQueueItem(ReportGenerationQueueItem item) {
		item.setStatus("Processing");
		item.setStartedAt(LocalDateTime.now());
		repository.save(item);

		try {
			Map<String, Object> parameters = readParameters(item.getParametersJson());
			GeneratedReportService.ReportGenerateRequest request = new GeneratedReportService.ReportGenerateRequest(
				item.getReportTemplateId(),
				null,
				parameters,
				item.getOutputFormat()
			);
			GeneratedReportService.GeneratedReportResponse generated = generatedReportService.generateFromQueue(
				request,
				item.getRequestedByTokenId(),
				item.getRequestedByTokenName(),
				""
			);
			item.setGeneratedReportFileId(generated.reportFileId());
			item.setStatus("Completed");
		} catch (RuntimeException exception) {
			item.setStatus("Failed");
			item.setErrorMessage(sanitizeMessage(exception.getMessage()));
		}

		item.setCompletedAt(LocalDateTime.now());
		repository.save(item);
		attemptWebhookDeliveryIfDue(item);
	}

	@Scheduled(fixedDelayString = "${app.queue.webhook.retry-poll-interval-ms:30000}")
	@Transactional
	public void processWebhookRetries() {
		LocalDateTime now = LocalDateTime.now();
		repository.findAllByStatusInOrderBySubmittedAtAsc(ACTIVE_WEBHOOK_STATUSES).stream()
			.filter(item -> "Pending".equals(item.getWebhookStatus()))
			.filter(item -> item.getNextWebhookAttemptAt() == null || !item.getNextWebhookAttemptAt().isAfter(now))
			.forEach(this::attemptWebhookDeliveryIfDue);
	}

	private void attemptWebhookDeliveryIfDue(ReportGenerationQueueItem item) {
		if (item.getCallbackUrl() == null || item.getCallbackUrl().isBlank() || !"Pending".equals(item.getWebhookStatus())) {
			return;
		}

		Map<String, Object> payload = buildWebhookPayload(item);
		WebhookDeliveryService.WebhookDeliveryResult result = webhookDeliveryService.deliver(item.getCallbackUrl(), payload);
		item.setLastWebhookAttemptAt(LocalDateTime.now());
		item.setLastWebhookResponseSummary(result.message());

		if (result.success()) {
			item.setWebhookStatus("Delivered");
			item.setNextWebhookAttemptAt(null);
			repository.save(item);
			auditLogService.logEvent(WEBHOOK_DELIVERED_EVENT, "Delivered webhook for queue item #" + item.getId() + " to " + item.getCallbackUrl() + ".", item.getRequestedByTokenName(), item.getReportTemplateName(), "Completed");
			return;
		}

		int attempts = item.getWebhookAttempts() + 1;
		item.setWebhookAttempts(attempts);
		if (attempts <= webhookRetryDelays.size()) {
			item.setNextWebhookAttemptAt(LocalDateTime.now().plus(webhookRetryDelays.get(attempts - 1)));
			item.setWebhookStatus("Pending");
		} else {
			item.setNextWebhookAttemptAt(null);
			item.setWebhookStatus("Failed");
		}
		repository.save(item);
		auditLogService.logEvent(WEBHOOK_FAILED_EVENT, "Webhook delivery failed for queue item #" + item.getId() + " (" + item.getCallbackUrl() + "): " + result.message(), item.getRequestedByTokenName(), item.getReportTemplateName(), "Failed");
	}

	private Map<String, Object> buildWebhookPayload(ReportGenerationQueueItem item) {
		Map<String, Object> payload = new LinkedHashMap<>();
		payload.put("queueId", item.getId());
		payload.put("status", item.getStatus());
		payload.put("reportTemplateName", item.getReportTemplateName());
		payload.put("reportFileId", item.getGeneratedReportFileId());
		payload.put("format", item.getOutputFormat());
		payload.put("downloadUrl", resolveWebhookDownloadUrl(item));
		payload.put("errorMessage", item.getErrorMessage());
		payload.put("generatedAt", item.getCompletedAt() == null ? null : item.getCompletedAt().toString());
		return payload;
	}

	private String resolveWebhookDownloadUrl(ReportGenerationQueueItem item) {
		if (item.getGeneratedReportFileId() == null) {
			return null;
		}

		String pathTemplate = downloadPathTemplateFor(item);
		try {
			return downloadUrlService.build(null, pathTemplate, item.getGeneratedReportFileId());
		} catch (IllegalArgumentException exception) {
			return pathTemplate.replace("{id}", String.valueOf(item.getGeneratedReportFileId()));
		}
	}

	private String downloadPathTemplateFor(ReportGenerationQueueItem item) {
		return item.getRequestedByTokenId() != null ? "/api/reports/files/{id}/download" : "/reports/files/{id}/download";
	}

	private QueueItemResponse toResponse(ReportGenerationQueueItem item) {
		return new QueueItemResponse(
			item.getId(),
			item.getStatus(),
			item.getReportTemplateName(),
			formatDateTime(item.getSubmittedAt())
		);
	}

	private QueueItemStatusResponse toStatusResponse(ReportGenerationQueueItem item, HttpServletRequest request) {
		return toStatusResponse(item, request, timeDisplayService.currentDisplayZoneId());
	}

	private QueueItemStatusResponse toStatusResponse(ReportGenerationQueueItem item, HttpServletRequest request, ZoneId displayZoneId) {
		String downloadUrl = null;
		if (item.getGeneratedReportFileId() != null) {
			try {
				downloadUrl = downloadUrlService.build(request, downloadPathTemplateFor(item), item.getGeneratedReportFileId());
			} catch (IllegalArgumentException exception) {
				downloadUrl = downloadPathTemplateFor(item).replace("{id}", String.valueOf(item.getGeneratedReportFileId()));
			}
		}

		return new QueueItemStatusResponse(
			item.getId(),
			item.getStatus(),
			item.getReportTemplateName(),
			item.getRequestedByTokenName(),
			item.getOutputFormat(),
			formatDateTime(item.getSubmittedAt(), displayZoneId),
			formatDateTime(item.getStartedAt(), displayZoneId),
			formatDateTime(item.getCompletedAt(), displayZoneId),
			item.getGeneratedReportFileId(),
			downloadUrl,
			item.getErrorMessage(),
			item.getCallbackUrl(),
			item.getWebhookStatus(),
			item.getWebhookAttempts(),
			item.getLastWebhookResponseSummary()
		);
	}

	private String formatDateTime(LocalDateTime value) {
		return formatDateTime(value, timeDisplayService.currentDisplayZoneId());
	}

	private String formatDateTime(LocalDateTime value, ZoneId displayZoneId) {
		return timeDisplayService.formatStoredDateTime(value, displayZoneId);
	}

	private String resolveActor(String actor) {
		return actor == null || actor.isBlank() ? "Unknown User" : actor.trim();
	}

	private String normalizeCallbackUrl(String callbackUrl) {
		if (callbackUrl == null || callbackUrl.isBlank()) {
			return null;
		}

		String normalized = callbackUrl.trim();
		try {
			URI uri = new URI(normalized);
			String scheme = uri.getScheme();
			if (scheme == null || (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme))) {
				throw new IllegalArgumentException("Callback URL must start with http:// or https://.");
			}
			if (uri.getHost() == null || uri.getHost().isBlank()) {
				throw new IllegalArgumentException("Callback URL must include a valid host.");
			}
			return uri.toString();
		} catch (URISyntaxException exception) {
			throw new IllegalArgumentException("Callback URL is invalid.");
		}
	}

	private List<Duration> parseRetryDelays(String retryDelaysMinutes) {
		if (retryDelaysMinutes == null || retryDelaysMinutes.isBlank()) {
			return List.of(Duration.ofMinutes(1), Duration.ofMinutes(5), Duration.ofMinutes(15));
		}

		return Arrays.stream(retryDelaysMinutes.split(","))
			.map(String::trim)
			.filter(value -> !value.isEmpty())
			.map(Long::parseLong)
			.map(Duration::ofMinutes)
			.toList();
	}

	private String writeParameters(Map<String, Object> parameters) {
		try {
			return objectMapper.writeValueAsString(parameters == null ? Map.of() : parameters);
		} catch (JsonProcessingException exception) {
			throw new IllegalArgumentException("Unable to store the queued report parameters.");
		}
	}

	private Map<String, Object> readParameters(String parametersJson) {
		if (parametersJson == null || parametersJson.isBlank()) {
			return Map.of();
		}

		try {
			return objectMapper.readValue(parametersJson, new TypeReference<Map<String, Object>>() {
			});
		} catch (JsonProcessingException exception) {
			throw new IllegalArgumentException("Unable to read the queued report parameters.");
		}
	}

	private String sanitizeMessage(String message) {
		if (message == null || message.isBlank()) {
			return "The report engine returned an empty error message.";
		}

		String normalized = message.replaceAll("\\s+", " ").trim();
		return normalized.length() > 180 ? normalized.substring(0, 177) + "..." : normalized;
	}

	public record QueueGenerateRequest(
		Long reportId,
		String templateCode,
		Map<String, Object> parameters,
		String format,
		String callbackUrl
	) {
	}

	public record QueueItemResponse(
		Long queueId,
		String status,
		String reportTemplateName,
		String submittedAt
	) {
	}

	public record QueueItemStatusResponse(
		Long queueId,
		String status,
		String reportTemplateName,
		String requestedBy,
		String format,
		String submittedAt,
		String startedAt,
		String completedAt,
		Long reportFileId,
		String downloadUrl,
		String errorMessage,
		String callbackUrl,
		String webhookStatus,
		int webhookAttempts,
		String lastWebhookResponseSummary
	) {
	}

	public record QueueItemPageResult(
		List<QueueItemStatusResponse> items,
		long totalItems,
		int pageNumber,
		int pageSize,
		int totalPages,
		boolean hasPrevious,
		boolean hasNext
	) {
	}

	public static class QueueItemNotFoundException extends RuntimeException {
		public QueueItemNotFoundException(long id) {
			super("Queue item " + id + " was not found.");
		}
	}
}
