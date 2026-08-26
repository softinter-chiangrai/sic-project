package dev.suksabai.report_service.controller;

import dev.suksabai.report_service.service.ReportGenerationQueueService;
import dev.suksabai.report_service.service.ReportTemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/report-queue")
@Tag(name = "Admin / Report Queue API", description = "Administrative APIs for submitting test queue requests and monitoring queued report generation.")
@SecurityRequirement(name = "sessionCookieAuth")
public class ReportQueueAdminApiController {

	private final ReportGenerationQueueService reportGenerationQueueService;

	public ReportQueueAdminApiController(ReportGenerationQueueService reportGenerationQueueService) {
		this.reportGenerationQueueService = reportGenerationQueueService;
	}

	@GetMapping
	@Operation(summary = "List queued report generation requests", description = "Return a paginated list of queued report generation requests for the admin monitor screen.")
	public ReportGenerationQueueService.QueueItemPageResult list(
		@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "10") int size,
		HttpServletRequest request
	) {
		return reportGenerationQueueService.getPage(page, size, request);
	}

	@GetMapping("/{id}")
	@Operation(summary = "Get a queued report generation request", description = "Load the status of a single queued report generation request.")
	public ReportGenerationQueueService.QueueItemStatusResponse getOne(@PathVariable long id, HttpServletRequest request) {
		return reportGenerationQueueService.getStatus(id, request);
	}

	@PostMapping
	@Operation(summary = "Submit a test queue request", description = "Submit a report generation request into the queue using the authenticated admin session.")
	public ReportGenerationQueueService.QueueItemResponse submit(
		@RequestBody ReportGenerationQueueService.QueueGenerateRequest request,
		Authentication authentication
	) {
		return reportGenerationQueueService.enqueueFromWeb(request, authentication == null ? null : authentication.getName());
	}

	@PostMapping("/{id}/retry-webhook")
	@Operation(summary = "Retry webhook delivery", description = "Manually retry webhook delivery for a queued report generation request.")
	public ReportGenerationQueueService.QueueItemStatusResponse retryWebhook(@PathVariable long id, HttpServletRequest request) {
		return reportGenerationQueueService.retryWebhookManually(id, request);
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException exception) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
			.body(Map.of("message", exception.getMessage()));
	}

	@ExceptionHandler(ReportGenerationQueueService.QueueItemNotFoundException.class)
	public ResponseEntity<Map<String, String>> handleNotFound(ReportGenerationQueueService.QueueItemNotFoundException exception) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
			.body(Map.of("message", exception.getMessage()));
	}

	@ExceptionHandler(ReportTemplateService.ReportTemplateNotFoundException.class)
	public ResponseEntity<Map<String, String>> handleTemplateNotFound(ReportTemplateService.ReportTemplateNotFoundException exception) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
			.body(Map.of("message", exception.getMessage()));
	}
}
