package dev.suksabai.report_service.controller;

import dev.suksabai.report_service.service.BulkReportGenerationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/report-bulk")
@Tag(name = "Admin / Bulk Report API", description = "Administrative APIs for submitting test bulk generation requests and reviewing bulk batch history.")
@SecurityRequirement(name = "sessionCookieAuth")
public class BulkReportAdminApiController {

	private final BulkReportGenerationService bulkReportGenerationService;

	public BulkReportAdminApiController(BulkReportGenerationService bulkReportGenerationService) {
		this.bulkReportGenerationService = bulkReportGenerationService;
	}

	@GetMapping
	@Operation(summary = "List bulk report batches", description = "Return a paginated list of past bulk report generation batches for the admin monitor screen.")
	public BulkReportGenerationService.BulkBatchPageResult list(
		@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "10") int size
	) {
		return bulkReportGenerationService.getPage(page, size);
	}

	@GetMapping("/{id}")
	@Operation(summary = "Get a bulk report batch", description = "Load per-item results for a single bulk report generation batch.")
	public BulkReportGenerationService.BulkBatchDetail getOne(@PathVariable long id) {
		return bulkReportGenerationService.getOne(id);
	}

	@PostMapping
	@Operation(summary = "Submit a test bulk generation request", description = "Submit a bulk report generation request using the authenticated admin session; returns batch metadata and a download link rather than the raw ZIP bytes.")
	public BulkSubmitResponse submit(@RequestBody List<BulkReportGenerationService.BulkGenerateItem> items, Authentication authentication) {
		BulkReportGenerationService.BulkGenerationSummary summary = bulkReportGenerationService.generateFromWeb(items, authentication == null ? null : authentication.getName());
		return new BulkSubmitResponse(
			summary.batchId(),
			summary.itemCount(),
			summary.successCount(),
			summary.failureCount(),
			"/reports/bulk/files/" + summary.batchId() + "/download"
		);
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException exception) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
			.body(Map.of("message", exception.getMessage()));
	}

	@ExceptionHandler(BulkReportGenerationService.BulkBatchNotFoundException.class)
	public ResponseEntity<Map<String, String>> handleNotFound(BulkReportGenerationService.BulkBatchNotFoundException exception) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
			.body(Map.of("message", exception.getMessage()));
	}

	public record BulkSubmitResponse(
		Long batchId,
		int itemCount,
		int successCount,
		int failureCount,
		String zipDownloadUrl
	) {
	}
}
