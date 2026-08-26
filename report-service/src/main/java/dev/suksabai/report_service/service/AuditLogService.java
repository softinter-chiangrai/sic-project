package dev.suksabai.report_service.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.suksabai.report_service.model.AuditLogEvent;
import dev.suksabai.report_service.repository.AuditLogEventRepository;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class AuditLogService {

	private static final List<String> EXPORT_HEADERS = List.of("Category", "Event", "Detail", "Actor", "Target", "Timestamp", "Status");
	private static final String COMPLETED_STATUS = "Completed";
	private static final String FAILED_STATUS = "Failed";
	private static final List<String> PRESERVED_CLEANUP_EVENT_NAMES = List.of("System Cleanup Executed", "System Reset Executed");

	private final AuditLogEventRepository auditLogEventRepository;
	private final ConfiguredTimeDisplayService timeDisplayService;
	private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

	public AuditLogService(AuditLogEventRepository auditLogEventRepository, ConfiguredTimeDisplayService timeDisplayService) {
		this.auditLogEventRepository = auditLogEventRepository;
		this.timeDisplayService = timeDisplayService;
	}

	@Transactional
	public void logAdminAction(String eventName, String eventDetail, String target) {
		logEvent(eventName, eventDetail, null, target, COMPLETED_STATUS);
	}

	@Transactional
	public void logDataSourceTest(String connectionLabel, boolean success, String message) {
		String detail = success
			? "Connection test passed for " + connectionLabel
			: "Connection test failed for " + connectionLabel + ": " + truncate(message);
		logEvent("Data Source Tested", detail, null, connectionLabel, success ? COMPLETED_STATUS : FAILED_STATUS);
	}

	@Transactional
	public void logReportGenerated(String templateName, String fileName, String actor) {
		logReportGenerated(templateName, fileName, actor, Map.of());
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void logReportGenerated(String templateName, String fileName, String actor, Map<String, Object> parameters) {
		logEvent(
			"Report Generated",
			"Generated file " + safeFileName(fileName) + ". Parameters: " + serializeParameters(parameters),
			actor,
			resolveReportTarget(templateName, "Unknown Report"),
			COMPLETED_STATUS
		);
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void logReportGenerationFailed(String templateName, String actor, Map<String, Object> parameters, String errorMessage) {
		logEvent(
			"Report Generated",
			"Failed to generate report. Parameters: " + serializeParameters(parameters) + ". Error: " + normalizeAuditMessage(errorMessage),
			actor,
			resolveReportTarget(templateName, "Unknown Report"),
			FAILED_STATUS
		);
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void logReportPreviewed(String templateName, Map<String, Object> parameters) {
		logEvent(
			"Report Previewed",
			"Generated preview. Parameters: " + serializeParameters(parameters),
			null,
			resolveReportTarget(templateName, "Report Preview"),
			COMPLETED_STATUS
		);
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void logReportPreviewFailed(String templateName, Map<String, Object> parameters, String errorMessage) {
		logEvent(
			"Report Previewed",
			"Failed to generate preview. Parameters: " + serializeParameters(parameters) + ". Error: " + normalizeAuditMessage(errorMessage),
			null,
			resolveReportTarget(templateName, "Report Preview"),
			FAILED_STATUS
		);
	}

	@Transactional
	public void logReportDownloaded(String templateName, String fileName, String actor) {
		logEvent("Report Downloaded", "Downloaded file " + fileName, actor, templateName, COMPLETED_STATUS);
	}

	@Transactional
	public void logEvent(String eventName, String eventDetail, String actor, String target, String status) {
		AuditLogEvent auditLogEvent = new AuditLogEvent();
		auditLogEvent.setEventName(requireText(eventName, "eventName"));
		auditLogEvent.setEventDetail(requireText(eventDetail, "eventDetail"));
		auditLogEvent.setActor(resolveActor(actor));
		auditLogEvent.setTarget(requireText(target, "target"));
		auditLogEvent.setStatus(requireText(status, "status"));
		auditLogEventRepository.save(auditLogEvent);
	}

	@Transactional(readOnly = true)
	public AuditLogPageResult getPage(String query, String category, String status, LocalDate fromDate, LocalDate toDate, int page, int size) {
		int safePage = Math.max(page, 0);
		int safeSize = Math.max(1, Math.min(size, 50));

		List<AuditLogListItem> filteredItems = getFilteredItems(query, category, status, fromDate, toDate);

		long totalItems = filteredItems.size();
		int totalPages = totalItems == 0 ? 0 : (int) Math.ceil((double) totalItems / safeSize);
		int resolvedPage = totalPages == 0 ? 0 : Math.min(safePage, totalPages - 1);
		int startIndex = Math.min(resolvedPage * safeSize, filteredItems.size());
		int endIndex = Math.min(startIndex + safeSize, filteredItems.size());

		PageImpl<AuditLogListItem> itemPage = new PageImpl<>(
			filteredItems.subList(startIndex, endIndex),
			PageRequest.of(resolvedPage, safeSize),
			totalItems
		);

		return new AuditLogPageResult(
			itemPage.getContent(),
			itemPage.getTotalElements(),
			itemPage.getNumber(),
			itemPage.getSize(),
			itemPage.getTotalPages(),
			itemPage.hasPrevious(),
			itemPage.hasNext()
		);
	}

	@Transactional(readOnly = true)
	public AuditLogExportFile export(String query, String category, String status, LocalDate fromDate, LocalDate toDate, String format) {
		String normalizedFormat = format == null || format.isBlank() ? "xlsx" : format.trim().toLowerCase(Locale.ROOT);
		return switch (normalizedFormat) {
			case "csv" -> new AuditLogExportFile("csv", new MediaType("text", "csv", java.nio.charset.StandardCharsets.UTF_8), exportCsv(query, category, status, fromDate, toDate));
			case "xlsx" -> new AuditLogExportFile("xlsx", new MediaType("application", "vnd.openxmlformats-officedocument.spreadsheetml.sheet"), exportXlsx(query, category, status, fromDate, toDate));
			default -> throw new IllegalArgumentException("Export format is invalid.");
		};
	}

	private byte[] exportCsv(String query, String category, String status, LocalDate fromDate, LocalDate toDate) {
		List<AuditLogListItem> filteredItems = getFilteredItems(query, category, status, fromDate, toDate);
		List<String> lines = new ArrayList<>();
		lines.add(String.join(",", EXPORT_HEADERS));
		for (AuditLogListItem item : filteredItems) {
			lines.add(String.join(",",
				csv(item.categoryLabel()),
				csv(item.eventName()),
				csv(item.eventDetail()),
				csv(item.actor()),
				csv(item.target()),
				csv(item.exportTimestamp()),
				csv(item.status())
			));
		}

		return String.join("\n", lines).getBytes(java.nio.charset.StandardCharsets.UTF_8);
	}

	private byte[] exportXlsx(String query, String category, String status, LocalDate fromDate, LocalDate toDate) {
		List<AuditLogListItem> filteredItems = getFilteredItems(query, category, status, fromDate, toDate);
		try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
			Sheet sheet = workbook.createSheet("Audit Logs");
			CellStyle headerStyle = createHeaderStyle(workbook);

			Row headerRow = sheet.createRow(0);
			for (int index = 0; index < EXPORT_HEADERS.size(); index++) {
				Cell cell = headerRow.createCell(index);
				cell.setCellValue(EXPORT_HEADERS.get(index));
				cell.setCellStyle(headerStyle);
			}

			int rowIndex = 1;
			for (AuditLogListItem item : filteredItems) {
				Row row = sheet.createRow(rowIndex++);
				row.createCell(0).setCellValue(item.categoryLabel());
				row.createCell(1).setCellValue(item.eventName());
				row.createCell(2).setCellValue(item.eventDetail());
				row.createCell(3).setCellValue(item.actor());
				row.createCell(4).setCellValue(item.target());
				row.createCell(5).setCellValue(item.exportTimestamp());
				row.createCell(6).setCellValue(item.status());
			}

			for (int index = 0; index < EXPORT_HEADERS.size(); index++) {
				sheet.autoSizeColumn(index);
			}

			workbook.write(outputStream);
			return outputStream.toByteArray();
		} catch (IOException exception) {
			throw new IllegalStateException("Unable to export audit logs.", exception);
		}
	}

	@Transactional(readOnly = true)
	public AuditLogStats getStats() {
		return new AuditLogStats(auditLogEventRepository.count());
	}

	@Transactional(readOnly = true)
	public List<RecentActivityItem> getRecentActivity(int limit) {
		int safeLimit = Math.max(0, limit);
		if (safeLimit == 0) {
			return List.of();
		}
		ZoneId displayZoneId = timeDisplayService.currentDisplayZoneId();

		return auditLogEventRepository.findAllByOrderByOccurredAtDesc().stream()
			.limit(safeLimit)
			.map(event -> toRecentActivityItem(event, displayZoneId))
			.toList();
	}

	@Transactional(readOnly = true)
	public LocalDate currentDisplayDate() {
		return timeDisplayService.currentDisplayDate();
	}

	@Transactional(readOnly = true)
	public LocalDateTime findLatestEventOccurredAt(String eventName) {
		if (eventName == null || eventName.isBlank()) {
			return null;
		}

		return auditLogEventRepository.findFirstByEventNameOrderByOccurredAtDesc(eventName.trim())
			.map(AuditLogEvent::getOccurredAt)
			.orElse(null);
	}

	@Transactional
	public long purgeAuditLogsPreservingCleanupHistory() {
		return auditLogEventRepository.deleteByEventNameNotIn(PRESERVED_CLEANUP_EVENT_NAMES);
	}

	private AuditLogListItem toListItem(AuditLogEvent event, ZoneId displayZoneId) {
		String categorySlug = resolveCategorySlug(event.getEventName());
		LocalDateTime displayedOccurredAt = timeDisplayService.toDisplayDateTime(event.getOccurredAt(), displayZoneId);
		return new AuditLogListItem(
			categorySlug,
			resolveCategoryLabel(categorySlug),
			event.getEventName(),
			event.getEventDetail(),
			event.getActor(),
			event.getTarget(),
			displayedOccurredAt,
			timeDisplayService.formatStoredDateTime(event.getOccurredAt(), displayZoneId),
			timeDisplayService.formatStoredExportDateTime(event.getOccurredAt(), displayZoneId),
			event.getStatus(),
			statusClassFor(event.getStatus())
		);
	}

	private RecentActivityItem toRecentActivityItem(AuditLogEvent event, ZoneId displayZoneId) {
		String categorySlug = resolveCategorySlug(event.getEventName());
		boolean failed = FAILED_STATUS.equalsIgnoreCase(event.getStatus());
		return new RecentActivityItem(
			event.getEventName(),
			buildRecentActivityDetail(event),
			timeDisplayService.formatStoredDateTime(event.getOccurredAt(), displayZoneId),
			event.getStatus(),
			failed ? "activity-item activity-item--error" : "activity-item activity-item--success",
			failed ? "activity-meta activity-meta--error" : "activity-meta",
			failed ? "activity-icon activity-icon--error" : "activity-icon",
			resolveRecentActivityIcon(categorySlug, failed)
		);
	}

	private String buildRecentActivityDetail(AuditLogEvent event) {
		String detail = event.getEventDetail() == null || event.getEventDetail().isBlank() ? event.getTarget() : event.getEventDetail();
		return detail + " • " + event.getActor();
	}

	private String resolveRecentActivityIcon(String categorySlug, boolean failed) {
		if (failed) {
			return "report_problem";
		}

		return switch (categorySlug) {
			case "report-templates" -> "description";
			case "data-sources" -> "database";
			case "access-tokens" -> "vpn_key";
			case "settings" -> "settings";
			default -> "folder_zip";
		};
	}

	private List<AuditLogListItem> getFilteredItems(String query, String category, String status, LocalDate fromDate, LocalDate toDate) {
		String normalizedQuery = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);
		String normalizedCategory = normalizeCategory(category);
		String normalizedStatus = normalizeStatus(status);
		ZoneId displayZoneId = timeDisplayService.currentDisplayZoneId();

		return auditLogEventRepository.findAllByOrderByOccurredAtDesc().stream()
			.map(event -> toListItem(event, displayZoneId))
			.filter(item -> matchesCategory(item, normalizedCategory))
			.filter(item -> matchesStatus(item, normalizedStatus))
			.filter(item -> matchesDateRange(item, fromDate, toDate))
			.filter(item -> matchesQuery(item, normalizedQuery))
			.toList();
	}

	private boolean matchesQuery(AuditLogListItem item, String query) {
		if (query.isBlank()) {
			return true;
		}

		return containsIgnoreCase(item.categoryLabel(), query)
			|| containsIgnoreCase(item.eventName(), query)
			|| containsIgnoreCase(item.eventDetail(), query)
			|| containsIgnoreCase(item.actor(), query)
			|| containsIgnoreCase(item.target(), query)
			|| containsIgnoreCase(item.status(), query);
	}

	private boolean matchesCategory(AuditLogListItem item, String category) {
		return category.isBlank() || item.categorySlug().equals(category);
	}

	private boolean matchesStatus(AuditLogListItem item, String status) {
		return status.isBlank() || item.status().equalsIgnoreCase(status);
	}

	private boolean matchesDateRange(AuditLogListItem item, LocalDate fromDate, LocalDate toDate) {
		if (fromDate == null && toDate == null) {
			return true;
		}

		if (item.occurredAt() == null) {
			return false;
		}

		LocalDate occurredDate = item.occurredAt().toLocalDate();
		if (fromDate != null && occurredDate.isBefore(fromDate)) {
			return false;
		}

		return toDate == null || !occurredDate.isAfter(toDate);
	}

	private boolean containsIgnoreCase(String value, String expected) {
		return value != null && value.toLowerCase(Locale.ROOT).contains(expected);
	}

	private String resolveActor(String actor) {
		if (actor != null && !actor.isBlank()) {
			return actor.trim();
		}

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
			return "System";
		}

		return authentication.getName();
	}

	private String requireText(String value, String fieldName) {
		if (value == null || value.isBlank()) {
			throw new IllegalArgumentException(fieldName + " is required.");
		}

		return truncate(value.trim());
	}

	private String truncate(String value) {
		return value.length() <= 500 ? value : value.substring(0, 497) + "...";
	}

	private String serializeParameters(Map<String, Object> parameters) {
		try {
			return objectMapper.writeValueAsString(parameters == null ? Map.of() : parameters);
		} catch (JsonProcessingException exception) {
			return "{\"_auditError\":\"Unable to serialize parameters\"}";
		}
	}

	private String normalizeAuditMessage(String message) {
		if (message == null || message.isBlank()) {
			return "The report engine returned an empty error message.";
		}

		return message.replaceAll("\\s+", " ").trim();
	}

	private String resolveReportTarget(String templateName, String fallbackTarget) {
		return templateName == null || templateName.isBlank() ? fallbackTarget : templateName.trim();
	}

	private String safeFileName(String fileName) {
		return fileName == null || fileName.isBlank() ? "report" : fileName.trim();
	}

	private String normalizeCategory(String category) {
		if (category == null || category.isBlank()) {
			return "";
		}

		return category.trim().toLowerCase(Locale.ROOT);
	}

	private String normalizeStatus(String status) {
		if (status == null || status.isBlank()) {
			return "";
		}

		return status.trim().toLowerCase(Locale.ROOT);
	}

	private String resolveCategorySlug(String eventName) {
		if (eventName == null || eventName.isBlank()) {
			return "reports";
		}

		String normalizedEventName = eventName.trim().toLowerCase(Locale.ROOT);
		if (normalizedEventName.startsWith("report template ")) {
			return "report-templates";
		}
		if (normalizedEventName.startsWith("data source ")) {
			return "data-sources";
		}
		if (normalizedEventName.startsWith("access token ")) {
			return "access-tokens";
		}
		if (normalizedEventName.startsWith("system ") || normalizedEventName.startsWith("generated reports auto cleanup")) {
			return "settings";
		}

		return "reports";
	}

	private String resolveCategoryLabel(String categorySlug) {
		return switch (categorySlug) {
			case "report-templates" -> "Report Templates";
			case "data-sources" -> "Data Sources";
			case "access-tokens" -> "Access Tokens";
			case "settings" -> "Settings";
			default -> "Reports";
		};
	}

	private String csv(String value) {
		String sanitized = value == null ? "" : value.replace("\"", "\"\"");
		return '"' + sanitized + '"';
	}

	private CellStyle createHeaderStyle(Workbook workbook) {
		Font font = workbook.createFont();
		font.setBold(true);

		CellStyle style = workbook.createCellStyle();
		style.setFont(font);
		return style;
	}

	private String statusClassFor(String status) {
		return FAILED_STATUS.equalsIgnoreCase(status) ? "pill pill--danger" : "pill pill--success";
	}

	public record AuditLogListItem(
		String categorySlug,
		String categoryLabel,
		String eventName,
		String eventDetail,
		String actor,
		String target,
		LocalDateTime occurredAt,
		String timestamp,
		String exportTimestamp,
		String status,
		String statusClass
	) {
	}

	public record AuditLogPageResult(
		List<AuditLogListItem> items,
		long totalItems,
		int pageNumber,
		int pageSize,
		int totalPages,
		boolean hasPrevious,
		boolean hasNext
	) {
	}

	public record AuditLogStats(long totalEvents) {
	}

	public record AuditLogExportFile(
		String extension,
		MediaType mediaType,
		byte[] content
	) {
	}

	public record RecentActivityItem(
		String title,
		String detail,
		String timestamp,
		String status,
		String itemClass,
		String metaClass,
		String iconClass,
		String iconName
	) {
	}
}