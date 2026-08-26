package dev.suksabai.report_service.controller;

import dev.suksabai.report_service.service.AccessTokenService;
import dev.suksabai.report_service.service.AuditLogService;
import dev.suksabai.report_service.service.BulkReportGenerationService;
import dev.suksabai.report_service.service.ConfiguredTimeDisplayService;
import dev.suksabai.report_service.service.DataSourceConfigService;
import dev.suksabai.report_service.service.DownloadUrlService;
import dev.suksabai.report_service.service.GeneratedReportService;
import dev.suksabai.report_service.service.ReportTemplateService;
import dev.suksabai.report_service.service.SystemSettingsService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.stream.IntStream;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Controller
public class PageController {
	private static final int DEFAULT_TABLE_PAGE_SIZE = 10;
	private static final DateTimeFormatter EXPORT_FILE_TIME_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");

	private final DataSourceConfigService dataSourceConfigService;
	private final ReportTemplateService reportTemplateService;
	private final AccessTokenService accessTokenService;
	private final GeneratedReportService generatedReportService;
	private final AuditLogService auditLogService;
	private final SystemSettingsService systemSettingsService;
	private final DownloadUrlService downloadUrlService;
	private final ConfiguredTimeDisplayService timeDisplayService;
	private final BulkReportGenerationService bulkReportGenerationService;

	public PageController(DataSourceConfigService dataSourceConfigService, ReportTemplateService reportTemplateService, AccessTokenService accessTokenService, GeneratedReportService generatedReportService, AuditLogService auditLogService, SystemSettingsService systemSettingsService, DownloadUrlService downloadUrlService, ConfiguredTimeDisplayService timeDisplayService, BulkReportGenerationService bulkReportGenerationService) {
		this.dataSourceConfigService = dataSourceConfigService;
		this.reportTemplateService = reportTemplateService;
		this.accessTokenService = accessTokenService;
		this.generatedReportService = generatedReportService;
		this.auditLogService = auditLogService;
		this.systemSettingsService = systemSettingsService;
		this.downloadUrlService = downloadUrlService;
		this.timeDisplayService = timeDisplayService;
		this.bulkReportGenerationService = bulkReportGenerationService;
	}

	@GetMapping("/login")
	public String login(Authentication authentication) {
		if (authentication != null && authentication.isAuthenticated() && !(authentication instanceof AnonymousAuthenticationToken)) {
			return "redirect:/";
		}

		return "login";
	}

	@GetMapping("/")
	public String home(Authentication authentication, Model model) {
		addCommonModel(authentication, model);
		model.addAttribute("dashboardReportStats", generatedReportService.getStats());
		model.addAttribute("dashboardTemplateStats", reportTemplateService.getStats());
		model.addAttribute("dashboardAccessTokenStats", accessTokenService.getStats());
		model.addAttribute("dashboardDataSourceStats", dataSourceConfigService.getStats());
		model.addAttribute("recentActivities", auditLogService.getRecentActivity(3));
		return "dashboard";
	}

	@GetMapping("/reports")
	public String reports(
		Authentication authentication,
		Model model,
		HttpServletRequest request,
		@RequestParam(defaultValue = "0") int templatePage,
		@RequestParam(defaultValue = "0") int filesPage,
		@RequestParam(required = false) Long selectedTemplateId
	) {
		addCommonModel(authentication, model);
		GeneratedReportService.ReportsStats reportStats = generatedReportService.getStats();
		ReportTemplateService.ReportTemplatePageResult templatePageResult = reportTemplateService.getPage(templatePage, DEFAULT_TABLE_PAGE_SIZE);
		Long resolvedSelectedTemplateId = resolveSelectedTemplateId(selectedTemplateId, templatePageResult.items());
		String downloadUrlTemplate = downloadUrlService.build(request, "/reports/files/{id}/download", "__id__");
		GeneratedReportService.GeneratedReportFilePageResult downloadFilePage = generatedReportService.getGeneratedFilesPage(resolvedSelectedTemplateId, filesPage, DEFAULT_TABLE_PAGE_SIZE, downloadUrlTemplate);
		String selectedTemplateName = resolveSelectedTemplateName(resolvedSelectedTemplateId, templatePageResult.items());

		model.addAttribute("reportStats", reportStats);
		model.addAttribute("reportTemplates", templatePageResult.items());
		model.addAttribute("selectedTemplateId", resolvedSelectedTemplateId);
		model.addAttribute("selectedTemplateName", selectedTemplateName);
		model.addAttribute("downloadFiles", downloadFilePage.items());

		model.addAttribute("currentTemplatePage", templatePageResult.pageNumber());
		model.addAttribute("templatePageSize", templatePageResult.pageSize());
		model.addAttribute("templateTotalPages", templatePageResult.totalPages());
		model.addAttribute("templateHasPreviousPage", templatePageResult.hasPrevious());
		model.addAttribute("templateHasNextPage", templatePageResult.hasNext());
		model.addAttribute("templatePageStart", templatePageResult.items().isEmpty() ? 0 : (templatePageResult.pageNumber() * templatePageResult.pageSize()) + 1);
		model.addAttribute("templatePageEnd", templatePageResult.items().isEmpty() ? 0 : (templatePageResult.pageNumber() * templatePageResult.pageSize()) + templatePageResult.items().size());
		model.addAttribute("templateFilteredTotal", templatePageResult.totalItems());
		model.addAttribute("templatePageNumbers", templatePageResult.totalPages() == 0 ? List.of() : IntStream.range(0, templatePageResult.totalPages()).boxed().toList());

		model.addAttribute("currentFilesPage", downloadFilePage.pageNumber());
		model.addAttribute("filesPageSize", downloadFilePage.pageSize());
		model.addAttribute("filesTotalPages", downloadFilePage.totalPages());
		model.addAttribute("filesHasPreviousPage", downloadFilePage.hasPrevious());
		model.addAttribute("filesHasNextPage", downloadFilePage.hasNext());
		model.addAttribute("filesPageStart", downloadFilePage.items().isEmpty() ? 0 : (downloadFilePage.pageNumber() * downloadFilePage.pageSize()) + 1);
		model.addAttribute("filesPageEnd", downloadFilePage.items().isEmpty() ? 0 : (downloadFilePage.pageNumber() * downloadFilePage.pageSize()) + downloadFilePage.items().size());
		model.addAttribute("filesFilteredTotal", downloadFilePage.totalItems());
		model.addAttribute("filesPageNumbers", downloadFilePage.totalPages() == 0 ? List.of() : IntStream.range(0, downloadFilePage.totalPages()).boxed().toList());
		return "reports";
	}

	@GetMapping("/reports/generate")
	public String reportGenerate(Authentication authentication, Model model) {
		addCommonModel(authentication, model);
		return "report-generate";
	}

	@GetMapping("/reports/queue")
	public String reportQueue(Authentication authentication, Model model) {
		addCommonModel(authentication, model);
		return "report-queue";
	}

	@GetMapping("/reports/bulk")
	public String reportBulk(Authentication authentication, Model model) {
		addCommonModel(authentication, model);
		return "report-bulk";
	}

	@GetMapping("/reports/bulk/files/{id}/download")
	public ResponseEntity<byte[]> downloadBulkBatchFile(@PathVariable long id) {
		BulkReportGenerationService.DownloadedBulkBatch downloaded;
		try {
			downloaded = bulkReportGenerationService.downloadBatch(id);
		} catch (BulkReportGenerationService.BulkBatchNotFoundException exception) {
			throw new ResponseStatusException(NOT_FOUND, exception.getMessage());
		}
		return ResponseEntity.ok()
			.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloaded.fileName() + "\"")
			.contentType(org.springframework.http.MediaType.parseMediaType("application/zip"))
			.body(downloaded.content());
	}

	@GetMapping("/reports/files/{id}/download")
	public ResponseEntity<byte[]> downloadReportFile(Authentication authentication, @PathVariable long id) {
		GeneratedReportService.DownloadedReportFile downloadedReportFile;
		try {
			downloadedReportFile = generatedReportService.downloadFromWeb(id, authentication == null ? null : authentication.getName());
		} catch (GeneratedReportService.GeneratedReportNotFoundException exception) {
			throw new ResponseStatusException(NOT_FOUND, exception.getMessage());
		}
		return ResponseEntity.ok()
			.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadedReportFile.fileName() + "\"")
			.contentType(downloadedReportFile.mediaType())
			.body(downloadedReportFile.content());
	}

	@GetMapping("/report-templates")
	public String reportTemplates(
		Authentication authentication,
		Model model,
		@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "10") int size
	) {
		addCommonModel(authentication, model);
		ReportTemplateService.ReportTemplatePageResult pageResult = reportTemplateService.getPage(page, size);
		model.addAttribute("reportTemplates", pageResult.items());
		model.addAttribute("reportTemplateStats", reportTemplateService.getStats());
		model.addAttribute("currentPage", pageResult.pageNumber());
		model.addAttribute("pageSize", pageResult.pageSize());
		model.addAttribute("totalPages", pageResult.totalPages());
		model.addAttribute("hasPreviousPage", pageResult.hasPrevious());
		model.addAttribute("hasNextPage", pageResult.hasNext());
		model.addAttribute("pageStart", pageResult.items().isEmpty() ? 0 : (pageResult.pageNumber() * pageResult.pageSize()) + 1);
		model.addAttribute("pageEnd", pageResult.items().isEmpty() ? 0 : (pageResult.pageNumber() * pageResult.pageSize()) + pageResult.items().size());
		model.addAttribute("filteredTotal", pageResult.totalItems());
		model.addAttribute("pageNumbers", pageResult.totalPages() == 0 ? List.of() : IntStream.range(0, pageResult.totalPages()).boxed().toList());
		return "report-templates";
	}

	@GetMapping("/report-templates/edit")
	public String reportTemplateEdit(Authentication authentication, Model model) {
		addCommonModel(authentication, model);
		model.addAttribute("reportTemplateId", null);
		model.addAttribute("editTitle", "Create Report Template");
		return "report-template-edit";
	}

	@GetMapping("/report-templates/edit/{id}")
	public String reportTemplateEdit(Authentication authentication, Model model, @PathVariable long id) {
		if (!reportTemplateService.exists(id)) {
			throw new ResponseStatusException(NOT_FOUND, "Report template not found");
		}

		addCommonModel(authentication, model);
		model.addAttribute("reportTemplateId", id);
		model.addAttribute("editTitle", "Edit Report Template");
		return "report-template-edit";
	}

	@PostMapping("/report-templates/delete/{id}")
	public String deleteReportTemplate(
		@PathVariable long id,
		@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "10") int size,
		RedirectAttributes redirectAttributes
	) {
		reportTemplateService.delete(id);
		redirectAttributes.addAttribute("page", page);
		redirectAttributes.addAttribute("size", size);
		return "redirect:/report-templates";
	}

	@GetMapping("/access-tokens")
	public String accessToken(
		Authentication authentication,
		Model model,
		@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "10") int size
	) {
		addCommonModel(authentication, model);
		AccessTokenService.AccessTokenPageResult pageResult = accessTokenService.getPage(page, size);
		model.addAttribute("accessTokens", pageResult.items());
		model.addAttribute("accessTokenStats", accessTokenService.getStats());
		model.addAttribute("currentPage", pageResult.pageNumber());
		model.addAttribute("pageSize", pageResult.pageSize());
		model.addAttribute("totalPages", pageResult.totalPages());
		model.addAttribute("hasPreviousPage", pageResult.hasPrevious());
		model.addAttribute("hasNextPage", pageResult.hasNext());
		model.addAttribute("pageStart", pageResult.items().isEmpty() ? 0 : (pageResult.pageNumber() * pageResult.pageSize()) + 1);
		model.addAttribute("pageEnd", pageResult.items().isEmpty() ? 0 : (pageResult.pageNumber() * pageResult.pageSize()) + pageResult.items().size());
		model.addAttribute("filteredTotal", pageResult.totalItems());
		model.addAttribute("pageNumbers", pageResult.totalPages() == 0 ? List.of() : IntStream.range(0, pageResult.totalPages()).boxed().toList());
		return "access-tokens";
	}

	@GetMapping("/access-tokens/edit")
	public String accessTokenEdit(Authentication authentication, Model model) {
		addCommonModel(authentication, model);
		model.addAttribute("accessTokenId", null);
		model.addAttribute("editTitle", "Create Access Token");
		return "access-token-edit";
	}

	@GetMapping("/access-tokens/edit/{id}")
	public String accessTokenEdit(Authentication authentication, Model model, @PathVariable long id) {
		if (!accessTokenService.exists(id)) {
			throw new ResponseStatusException(NOT_FOUND, "Access token not found");
		}

		addCommonModel(authentication, model);
		model.addAttribute("accessTokenId", id);
		model.addAttribute("editTitle", "Edit Access Token");
		return "access-token-edit";
	}

	@PostMapping("/access-tokens/revoke/{id}")
	public String revokeAccessToken(
		@PathVariable long id,
		@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "10") int size,
		RedirectAttributes redirectAttributes
	) {
		accessTokenService.revokeForList(id);
		redirectAttributes.addAttribute("page", page);
		redirectAttributes.addAttribute("size", size);
		return "redirect:/access-tokens";
	}

	@PostMapping("/access-tokens/delete/{id}")
	public String deleteAccessToken(
		@PathVariable long id,
		@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "10") int size,
		RedirectAttributes redirectAttributes
	) {
		accessTokenService.delete(id);
		redirectAttributes.addAttribute("page", page);
		redirectAttributes.addAttribute("size", size);
		return "redirect:/access-tokens";
	}

	@GetMapping("/data-sources")
	public String dataSources(
		Authentication authentication,
		Model model,
		@RequestParam(defaultValue = "") String q,
		@RequestParam(defaultValue = "") String type,
		@RequestParam(defaultValue = "") String status,
		@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "10") int size
	) {
		addCommonModel(authentication, model);
		DataSourceConfigService.DataSourcePageResult pageResult = dataSourceConfigService.getPage(q, type, status, page, size);
		model.addAttribute("dataSources", pageResult.items());
		model.addAttribute("dataSourceStats", dataSourceConfigService.getStats());
		model.addAttribute("currentQuery", q);
		model.addAttribute("currentType", type);
		model.addAttribute("currentStatus", status);
		model.addAttribute("currentPage", pageResult.pageNumber());
		model.addAttribute("pageSize", pageResult.pageSize());
		model.addAttribute("totalPages", pageResult.totalPages());
		model.addAttribute("hasPreviousPage", pageResult.hasPrevious());
		model.addAttribute("hasNextPage", pageResult.hasNext());
		model.addAttribute("pageStart", pageResult.items().isEmpty() ? 0 : (pageResult.pageNumber() * pageResult.pageSize()) + 1);
		model.addAttribute("pageEnd", pageResult.items().isEmpty() ? 0 : (pageResult.pageNumber() * pageResult.pageSize()) + pageResult.items().size());
		model.addAttribute("filteredTotal", pageResult.totalItems());
		model.addAttribute("pageNumbers", pageResult.totalPages() == 0 ? List.of() : IntStream.range(0, pageResult.totalPages()).boxed().toList());
		return "data-sources";
	}

	@PostMapping("/data-sources/delete/{id}")
	public String deleteDataSource(
		@PathVariable long id,
		@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "10") int size,
		RedirectAttributes redirectAttributes
	) {
		dataSourceConfigService.delete(id);
		redirectAttributes.addAttribute("page", page);
		redirectAttributes.addAttribute("size", size);
		return "redirect:/data-sources";
	}

	@GetMapping("/data-sources/edit")
	public String dataSourceEdit(Authentication authentication, Model model) {
		addCommonModel(authentication, model);
		model.addAttribute("dataSourceId", null);
		model.addAttribute("editTitle", "Create Data Source");
		return "data-source-edit";
	}

	@GetMapping("/data-sources/edit/{id}")
	public String dataSourceEdit(Authentication authentication, Model model, @PathVariable long id) {
		if (!dataSourceConfigService.exists(id)) {
			throw new ResponseStatusException(NOT_FOUND, "Data source not found");
		}

		addCommonModel(authentication, model);
		model.addAttribute("dataSourceId", id);
		model.addAttribute("editTitle", "Edit Data Source");
		return "data-source-edit";
	}

	@GetMapping("/audit-logs")
	public String auditLogs(
		Authentication authentication,
		Model model,
		@RequestParam(defaultValue = "") String q,
		@RequestParam(defaultValue = "") String category,
		@RequestParam(defaultValue = "") String status,
		@RequestParam(required = false) String datePreset,
		@RequestParam(required = false) LocalDate fromDate,
		@RequestParam(required = false) LocalDate toDate,
		@RequestParam(defaultValue = "xlsx") String format,
		@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "10") int size
	) {
		addCommonModel(authentication, model);
		LocalDate today = auditLogService.currentDisplayDate();
		AuditLogService.AuditLogPageResult pageResult = auditLogService.getPage(q, category, status, fromDate, toDate, page, size);
		model.addAttribute("auditLogs", pageResult.items());
		model.addAttribute("currentQuery", q);
		model.addAttribute("currentCategory", category);
		model.addAttribute("currentStatus", status);
		model.addAttribute("currentFromDate", fromDate);
		model.addAttribute("currentToDate", toDate);
		model.addAttribute("currentDatePreset", resolveAuditLogDatePreset(datePreset, fromDate, toDate, today));
		model.addAttribute("auditLogPresetToday", today);
		model.addAttribute("auditLogPresetLast7Start", today.minusDays(6));
		model.addAttribute("auditLogPresetMonthStart", today.withDayOfMonth(1));
		model.addAttribute("currentFormat", format);
		model.addAttribute("currentPage", pageResult.pageNumber());
		model.addAttribute("pageSize", pageResult.pageSize());
		model.addAttribute("totalPages", pageResult.totalPages());
		model.addAttribute("hasPreviousPage", pageResult.hasPrevious());
		model.addAttribute("hasNextPage", pageResult.hasNext());
		model.addAttribute("pageStart", pageResult.items().isEmpty() ? 0 : (pageResult.pageNumber() * pageResult.pageSize()) + 1);
		model.addAttribute("pageEnd", pageResult.items().isEmpty() ? 0 : (pageResult.pageNumber() * pageResult.pageSize()) + pageResult.items().size());
		model.addAttribute("filteredTotal", pageResult.totalItems());
		model.addAttribute("pageNumbers", pageResult.totalPages() == 0 ? List.of() : IntStream.range(0, pageResult.totalPages()).boxed().toList());
		return "audit-logs";
	}

	@GetMapping("/settings")
	public String settings(Authentication authentication, Model model, HttpServletRequest request) {
		addCommonModel(authentication, model);
		model.addAttribute("settingsSummary", systemSettingsService.getSettings(request));
		return "settings";
	}

	@GetMapping("/audit-logs/export")
	public ResponseEntity<byte[]> exportAuditLogs(
		@RequestParam(defaultValue = "") String q,
		@RequestParam(defaultValue = "") String category,
		@RequestParam(defaultValue = "") String status,
		@RequestParam(required = false) LocalDate fromDate,
		@RequestParam(required = false) LocalDate toDate,
		@RequestParam(defaultValue = "xlsx") String format
	) {
		AuditLogService.AuditLogExportFile exportFile = auditLogService.export(q, category, status, fromDate, toDate, format);
		String fileName = buildAuditLogExportFileName(q, category, status, fromDate, toDate, exportFile.extension());
		return ResponseEntity.ok()
			.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
			.contentType(exportFile.mediaType())
			.body(exportFile.content());
	}

	private String resolveAuditLogDatePreset(String requestedPreset, LocalDate fromDate, LocalDate toDate, LocalDate today) {
		String normalizedPreset = normalizeAuditLogDatePreset(requestedPreset);
		if (normalizedPreset.isBlank()) {
			return "";
		}

		if (fromDate == null || toDate == null) {
			return "";
		}

		return switch (normalizedPreset) {
			case "today" -> fromDate.equals(today) && toDate.equals(today) ? normalizedPreset : "";
			case "last-7-days" -> fromDate.equals(today.minusDays(6)) && toDate.equals(today) ? normalizedPreset : "";
			case "this-month" -> fromDate.equals(today.withDayOfMonth(1)) && toDate.equals(today) ? normalizedPreset : "";
			default -> "";
		};
	}

	private String normalizeAuditLogDatePreset(String requestedPreset) {
		if (requestedPreset == null || requestedPreset.isBlank()) {
			return "";
		}

		return switch (requestedPreset) {
			case "today", "last-7-days", "this-month" -> requestedPreset;
			default -> "";
		};
	}

	private String buildAuditLogExportFileName(String query, String category, String status, LocalDate fromDate, LocalDate toDate, String extension) {
		List<String> segments = new java.util.ArrayList<>();
		segments.add("audit-logs");
		appendExportSegment(segments, category);
		appendExportSegment(segments, status);
		if (fromDate != null) {
			segments.add("from-" + fromDate.format(DateTimeFormatter.BASIC_ISO_DATE));
		}
		if (toDate != null) {
			segments.add("to-" + toDate.format(DateTimeFormatter.BASIC_ISO_DATE));
		}
		appendExportSegment(segments, query);
		segments.add(LocalDateTime.now(timeDisplayService.currentDisplayZoneId()).format(EXPORT_FILE_TIME_FORMAT));
		return String.join("-", segments) + "." + extension;
	}

	private void appendExportSegment(List<String> segments, String value) {
		if (value == null || value.isBlank()) {
			return;
		}

		String slug = value.trim().toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("^-+|-+$", "");
		if (slug.isBlank()) {
			return;
		}

		segments.add(slug.length() > 30 ? slug.substring(0, 30) : slug);
	}

	private void addCommonModel(Authentication authentication, Model model) {
		model.addAttribute("username", authentication.getName());
	}

	private Long resolveSelectedTemplateId(Long selectedTemplateId, List<ReportTemplateService.ReportTemplateListItem> templates) {
		if (selectedTemplateId != null && reportTemplateService.exists(selectedTemplateId)) {
			return selectedTemplateId;
		}

		return templates.isEmpty() ? null : templates.getFirst().id();
	}

	private String resolveSelectedTemplateName(Long selectedTemplateId, List<ReportTemplateService.ReportTemplateListItem> templates) {
		if (selectedTemplateId == null) {
			return null;
		}

		return templates.stream()
			.filter(template -> selectedTemplateId.equals(template.id()))
			.findFirst()
			.map(ReportTemplateService.ReportTemplateListItem::templateName)
			.orElseGet(() -> reportTemplateService.getTemplate(selectedTemplateId).templateName());
	}
}