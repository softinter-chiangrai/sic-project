package dev.suksabai.report_service.controller;

import dev.suksabai.report_service.config.AccessTokenApiFilter;
import dev.suksabai.report_service.service.AccessTokenService;
import dev.suksabai.report_service.service.BulkReportGenerationService;
import dev.suksabai.report_service.service.DownloadUrlService;
import dev.suksabai.report_service.service.GeneratedReportService;
import dev.suksabai.report_service.service.ReportGenerationQueueService;
import dev.suksabai.report_service.service.ReportTemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Reports / Execution API", description = "Report generation with X-Access-Token and public generated-file downloads.")
public class ReportApiController {

	private final GeneratedReportService generatedReportService;
	private final DownloadUrlService downloadUrlService;
	private final ReportGenerationQueueService reportGenerationQueueService;
	private final BulkReportGenerationService bulkReportGenerationService;

	public ReportApiController(
		GeneratedReportService generatedReportService,
		DownloadUrlService downloadUrlService,
		ReportGenerationQueueService reportGenerationQueueService,
		BulkReportGenerationService bulkReportGenerationService
	) {
		this.generatedReportService = generatedReportService;
		this.downloadUrlService = downloadUrlService;
		this.reportGenerationQueueService = reportGenerationQueueService;
		this.bulkReportGenerationService = bulkReportGenerationService;
	}

	@PostMapping("/generate")
	@Operation(
		summary = "Generate report",
		description = "Generate a report from a saved template by report id or template code. Authenticate with X-Access-Token.",
		security = {
			@SecurityRequirement(name = "reportAccessTokenHeader")
		}
	)
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "Report generated successfully"),
		@ApiResponse(responseCode = "400", description = "Invalid report id/template code, format, or parameters"),
		@ApiResponse(responseCode = "401", description = "Missing, expired, or revoked access token"),
		@ApiResponse(responseCode = "404", description = "Report template not found")
	})
	public GeneratedReportService.GeneratedReportResponse generate(
		@RequestBody GeneratedReportService.ReportGenerateRequest request,
		@Parameter(
			name = "X-Access-Token",
			required = false,
			description = "Header for sending the raw report access token.",
			example = "your_active_access_token"
		)
		HttpServletRequest httpServletRequest
	) {
		AccessTokenService.ApiAccessToken apiAccessToken = requireApiAccessToken(httpServletRequest);
		String downloadUrl = downloadUrlService.build(httpServletRequest, "/api/reports/files/{id}/download", "__id__");
		GeneratedReportService.GeneratedReportResponse generated = generatedReportService.generate(request, apiAccessToken, downloadUrl);
		return new GeneratedReportService.GeneratedReportResponse(
			generated.reportFileId(),
			generated.reportId(),
			generated.reportTemplateName(),
			generated.format(),
			generated.fileName(),
			downloadUrl.replace("__id__", String.valueOf(generated.reportFileId())),
			generated.generatedAt()
		);
	}

	@GetMapping("/files/{id}/download")
	@Operation(
		summary = "Download generated report",
		description = "Download a generated report file by generated report id. Authenticate with X-Access-Token.",
		security = {
			@SecurityRequirement(name = "reportAccessTokenHeader")
		}
	)
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "Generated report file returned"),
		@ApiResponse(responseCode = "401", description = "Missing, expired, or revoked access token"),
		@ApiResponse(responseCode = "404", description = "Generated report file not found")
	})
	public ResponseEntity<byte[]> download(@PathVariable long id, HttpServletRequest httpServletRequest) {
		GeneratedReportService.DownloadedReportFile downloadedReportFile = generatedReportService.downloadFromApi(id, requireApiAccessToken(httpServletRequest));
		return ResponseEntity.ok()
			.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadedReportFile.fileName() + "\"")
			.contentType(downloadedReportFile.mediaType())
			.body(downloadedReportFile.content());
	}

	@PostMapping("/generate/queue")
	@Operation(
		summary = "Queue report generation",
		description = "Queue a report generation request. The system processes the queue in the background and, if a callbackUrl is provided, notifies it via webhook once generation completes.",
		security = {
			@SecurityRequirement(name = "reportAccessTokenHeader")
		}
	)
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "Report generation queued successfully"),
		@ApiResponse(responseCode = "400", description = "Invalid report id/template code, format, or callback URL"),
		@ApiResponse(responseCode = "401", description = "Missing, expired, or revoked access token"),
		@ApiResponse(responseCode = "404", description = "Report template not found")
	})
	public ReportGenerationQueueService.QueueItemResponse queueGenerate(
		@RequestBody ReportGenerationQueueService.QueueGenerateRequest request,
		HttpServletRequest httpServletRequest
	) {
		return reportGenerationQueueService.enqueueFromApi(request, requireApiAccessToken(httpServletRequest));
	}

	@GetMapping("/generate/queue/{id}")
	@Operation(
		summary = "Get queued report generation status",
		description = "Check the status of a previously queued report generation request.",
		security = {
			@SecurityRequirement(name = "reportAccessTokenHeader")
		}
	)
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "Queue item status returned"),
		@ApiResponse(responseCode = "401", description = "Missing, expired, or revoked access token"),
		@ApiResponse(responseCode = "404", description = "Queue item not found")
	})
	public ReportGenerationQueueService.QueueItemStatusResponse queueStatus(@PathVariable long id, HttpServletRequest httpServletRequest) {
		requireApiAccessToken(httpServletRequest);
		return reportGenerationQueueService.getStatus(id, httpServletRequest);
	}

	@PostMapping("/generate/bulk")
	@Operation(
		summary = "Bulk generate reports",
		description = "Generate multiple reports from a JSON array of items (report id/code, parameters, format, file name) and return a ZIP file.",
		security = {
			@SecurityRequirement(name = "reportAccessTokenHeader")
		}
	)
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "ZIP file containing generated reports and a manifest returned"),
		@ApiResponse(responseCode = "400", description = "Invalid or empty item list"),
		@ApiResponse(responseCode = "401", description = "Missing, expired, or revoked access token")
	})
	public ResponseEntity<byte[]> bulkGenerate(
		@RequestBody List<BulkReportGenerationService.BulkGenerateItem> items,
		HttpServletRequest httpServletRequest
	) {
		BulkReportGenerationService.BulkGenerationResult result = bulkReportGenerationService.generateFromApi(items, requireApiAccessToken(httpServletRequest));
		return ResponseEntity.ok()
			.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + result.zipFileName() + "\"")
			.contentType(MediaType.parseMediaType("application/zip"))
			.body(result.zipContent());
	}

	@GetMapping("/generate/bulk/{id}/download")
	@Operation(
		summary = "Redownload a bulk generation batch",
		description = "Download the ZIP file produced by a previous bulk generation request.",
		security = {
			@SecurityRequirement(name = "reportAccessTokenHeader")
		}
	)
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "ZIP file returned"),
		@ApiResponse(responseCode = "401", description = "Missing, expired, or revoked access token"),
		@ApiResponse(responseCode = "404", description = "Bulk batch not found")
	})
	public ResponseEntity<byte[]> bulkDownload(@PathVariable long id, HttpServletRequest httpServletRequest) {
		requireApiAccessToken(httpServletRequest);
		BulkReportGenerationService.DownloadedBulkBatch downloaded = bulkReportGenerationService.downloadBatch(id);
		return ResponseEntity.ok()
			.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloaded.fileName() + "\"")
			.contentType(MediaType.parseMediaType("application/zip"))
			.body(downloaded.content());
	}

	private AccessTokenService.ApiAccessToken requireApiAccessToken(HttpServletRequest request) {
		Object accessToken = request.getAttribute(AccessTokenApiFilter.REQUEST_ATTRIBUTE);
		if (accessToken instanceof AccessTokenService.ApiAccessToken apiAccessToken) {
			return apiAccessToken;
		}

		throw new AccessTokenService.InvalidAccessTokenException("Access token is required.");
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException exception) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
			.body(Map.of("message", exception.getMessage()));
	}

	@ExceptionHandler(GeneratedReportService.GeneratedReportNotFoundException.class)
	public ResponseEntity<Map<String, String>> handleGeneratedReportNotFound(GeneratedReportService.GeneratedReportNotFoundException exception) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
			.body(Map.of("message", exception.getMessage()));
	}

	@ExceptionHandler(ReportTemplateService.ReportTemplateNotFoundException.class)
	public ResponseEntity<Map<String, String>> handleTemplateNotFound(ReportTemplateService.ReportTemplateNotFoundException exception) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
			.body(Map.of("message", exception.getMessage()));
	}

	@ExceptionHandler(ReportGenerationQueueService.QueueItemNotFoundException.class)
	public ResponseEntity<Map<String, String>> handleQueueItemNotFound(ReportGenerationQueueService.QueueItemNotFoundException exception) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
			.body(Map.of("message", exception.getMessage()));
	}

	@ExceptionHandler(BulkReportGenerationService.BulkBatchNotFoundException.class)
	public ResponseEntity<Map<String, String>> handleBulkBatchNotFound(BulkReportGenerationService.BulkBatchNotFoundException exception) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
			.body(Map.of("message", exception.getMessage()));
	}
}