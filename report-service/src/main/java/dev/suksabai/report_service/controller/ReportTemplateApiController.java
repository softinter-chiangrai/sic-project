package dev.suksabai.report_service.controller;

import dev.suksabai.report_service.service.DownloadUrlService;
import dev.suksabai.report_service.service.ReportTemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/report-templates")
@Tag(name = "Admin / Report Templates API", description = "Administrative APIs for uploading, previewing, updating, and deleting Jasper report templates.")
@SecurityRequirement(name = "sessionCookieAuth")
public class ReportTemplateApiController {

	private final ReportTemplateService reportTemplateService;
	private final dev.suksabai.report_service.service.GeneratedReportService generatedReportService;
	private final DownloadUrlService downloadUrlService;

	public ReportTemplateApiController(
		ReportTemplateService reportTemplateService,
		dev.suksabai.report_service.service.GeneratedReportService generatedReportService,
		DownloadUrlService downloadUrlService
	) {
		this.reportTemplateService = reportTemplateService;
		this.generatedReportService = generatedReportService;
		this.downloadUrlService = downloadUrlService;
	}

	@GetMapping
	@Operation(summary = "List report templates", description = "Return all saved report template summaries for administration screens.")
	public List<ReportTemplateService.ReportTemplateListItem> list() {
		return reportTemplateService.getAllSummaries();
	}

	@GetMapping("/{id}")
	@Operation(summary = "Get report template", description = "Load a saved report template definition for editing.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "Report template returned successfully"),
		@ApiResponse(responseCode = "404", description = "Report template not found")
	})
	public ReportTemplateService.ReportTemplatePayload getOne(@PathVariable long id) {
		return reportTemplateService.getTemplate(id);
	}

	@GetMapping(path = "/{id}/jrxml", produces = MediaType.APPLICATION_XML_VALUE)
	@Operation(summary = "Download saved JRXML", description = "Download the JRXML file that belongs to a saved report template.")
	public ResponseEntity<byte[]> downloadSavedJrxml(@PathVariable long id) {
		return buildDownloadResponse(reportTemplateService.downloadJrxml(id, null));
	}

	@GetMapping(path = "/download", produces = MediaType.APPLICATION_XML_VALUE)
	@Operation(summary = "Download staged JRXML", description = "Download a JRXML file from either a saved template id or a temporary upload token.")
	public ResponseEntity<byte[]> downloadJrxml(@RequestParam(required = false) Long templateId, @RequestParam(required = false) String uploadToken) {
		return buildDownloadResponse(reportTemplateService.downloadJrxml(templateId, uploadToken));
	}

	@PostMapping
	@Operation(summary = "Create report template", description = "Create a new report template from uploaded JRXML metadata and selected data source.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "Report template created successfully"),
		@ApiResponse(responseCode = "400", description = "Invalid report template payload")
	})
	public ReportTemplateService.ReportTemplatePayload create(@RequestBody ReportTemplateService.ReportTemplateSaveRequest request) {
		return reportTemplateService.create(request);
	}

	@PutMapping("/{id}")
	@Operation(summary = "Update report template", description = "Update a saved report template and its data source mapping.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "Report template updated successfully"),
		@ApiResponse(responseCode = "400", description = "Invalid report template payload"),
		@ApiResponse(responseCode = "404", description = "Report template not found")
	})
	public ReportTemplateService.ReportTemplatePayload update(@PathVariable long id, @RequestBody ReportTemplateService.ReportTemplateSaveRequest request) {
		return reportTemplateService.update(id, request);
	}

	@DeleteMapping("/{id}")
	@Operation(summary = "Delete report template", description = "Delete a saved report template and its stored JRXML and Jasper artifacts.")
	@ApiResponses({
		@ApiResponse(responseCode = "204", description = "Report template deleted successfully"),
		@ApiResponse(responseCode = "404", description = "Report template not found")
	})
	public ResponseEntity<Void> delete(@PathVariable long id) {
		reportTemplateService.delete(id);
		return ResponseEntity.noContent().build();
	}

	@PostMapping(path = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@Operation(summary = "Upload JRXML", description = "Upload and compile a JRXML file so parameters can be inspected before saving the template.")
	public ReportTemplateService.ReportTemplateUploadResponse upload(@RequestParam("file") MultipartFile file) {
		return reportTemplateService.uploadJrxml(file);
	}

	@PostMapping(path = "/preview", produces = {MediaType.APPLICATION_PDF_VALUE, MediaType.APPLICATION_JSON_VALUE})
	@Operation(summary = "Preview report template", description = "Render a PDF preview from a saved or staged report template using the supplied parameters.")
	public ResponseEntity<?> preview(@RequestBody ReportTemplateService.ReportTemplatePreviewRequest request) {
		try {
			byte[] pdf = reportTemplateService.preview(request);
			return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=report-preview.pdf")
				.contentType(MediaType.APPLICATION_PDF)
				.body(pdf);
		} catch (IllegalArgumentException exception) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.contentType(MediaType.APPLICATION_JSON)
				.body(Map.of("message", exception.getMessage()));
		} catch (ReportTemplateService.ReportTemplateNotFoundException exception) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.contentType(MediaType.APPLICATION_JSON)
				.body(Map.of("message", exception.getMessage()));
		}
	}

	@PostMapping(path = "/{id}/generate")
	@Operation(summary = "Generate saved report template", description = "Generate a downloadable report file from a saved template using the authenticated admin session.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "Report generated successfully"),
		@ApiResponse(responseCode = "400", description = "Invalid report format or parameters"),
		@ApiResponse(responseCode = "404", description = "Report template not found")
	})
	public dev.suksabai.report_service.service.GeneratedReportService.GeneratedReportResponse generate(
		@PathVariable long id,
		@RequestBody(required = false) ReportTemplateGenerateRequest request,
		Authentication authentication,
		HttpServletRequest httpServletRequest
	) {
		String downloadUrl = downloadUrlService.build(httpServletRequest, "/reports/files/{id}/download", "__id__");
		Map<String, Object> parameters = request == null || request.parameters() == null ? Map.of() : request.parameters();
		dev.suksabai.report_service.service.GeneratedReportService.GeneratedReportResponse generated = generatedReportService.generateFromWeb(
			new dev.suksabai.report_service.service.GeneratedReportService.ReportGenerateRequest(id, null, parameters, request == null ? null : request.format()),
			authentication == null ? null : authentication.getName(),
			downloadUrl
		);
		return new dev.suksabai.report_service.service.GeneratedReportService.GeneratedReportResponse(
			generated.reportFileId(),
			generated.reportId(),
			generated.reportTemplateName(),
			generated.format(),
			generated.fileName(),
			downloadUrl.replace("__id__", String.valueOf(generated.reportFileId())),
			generated.generatedAt()
		);
	}

	private ResponseEntity<byte[]> buildDownloadResponse(ReportTemplateService.DownloadedTemplateFile file) {
		return ResponseEntity.ok()
			.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.fileName() + "\"")
			.contentType(MediaType.APPLICATION_XML)
			.body(file.content());
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException exception) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
			.body(Map.of("message", exception.getMessage()));
	}

	@ExceptionHandler(ReportTemplateService.ReportTemplateNotFoundException.class)
	public ResponseEntity<Map<String, String>> handleNotFound(ReportTemplateService.ReportTemplateNotFoundException exception) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
			.body(Map.of("message", exception.getMessage()));
	}

	public record ReportTemplateGenerateRequest(
		Map<String, Object> parameters,
		String format
	) {
	}
}