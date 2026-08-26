package dev.suksabai.report_service.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.suksabai.report_service.model.GeneratedReportFile;
import dev.suksabai.report_service.model.ReportDownloadLog;
import dev.suksabai.report_service.repository.GeneratedReportFileRepository;
import dev.suksabai.report_service.repository.ReportDownloadLogRepository;
import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.export.ooxml.JRDocxExporter;
import net.sf.jasperreports.engine.export.ooxml.JRXlsxExporter;
import net.sf.jasperreports.export.SimpleExporterInput;
import net.sf.jasperreports.export.SimpleOutputStreamExporterOutput;
import net.sf.jasperreports.export.SimpleXlsxReportConfiguration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.ZoneId;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class GeneratedReportService {

	private static final DateTimeFormatter FILE_NAME_TIME_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");

	private final GeneratedReportFileRepository generatedReportFileRepository;
	private final ReportDownloadLogRepository reportDownloadLogRepository;
	private final ReportTemplateService reportTemplateService;
	private final AuditLogService auditLogService;
	private final ConfiguredTimeDisplayService timeDisplayService;
	private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
	private final Path reportsOutputDirectory;

	public GeneratedReportService(
		GeneratedReportFileRepository generatedReportFileRepository,
		ReportDownloadLogRepository reportDownloadLogRepository,
		ReportTemplateService reportTemplateService,
		AuditLogService auditLogService,
		ConfiguredTimeDisplayService timeDisplayService,
		@Value("${file.reports-output-dir:data/reports}") String reportsOutputDirectory
	) {
		this.generatedReportFileRepository = generatedReportFileRepository;
		this.reportDownloadLogRepository = reportDownloadLogRepository;
		this.reportTemplateService = reportTemplateService;
		this.auditLogService = auditLogService;
		this.timeDisplayService = timeDisplayService;
		this.reportsOutputDirectory = Path.of(reportsOutputDirectory).toAbsolutePath().normalize();
	}

	@Transactional
	public GeneratedReportResponse generate(
		ReportGenerateRequest request,
		AccessTokenService.ApiAccessToken apiAccessToken,
		String downloadUrl
	) {
		return generate(request, apiAccessToken == null ? null : apiAccessToken.id(), apiAccessToken == null ? null : apiAccessToken.tokenName(), downloadUrl);
	}

	@Transactional
	public GeneratedReportResponse generateFromWeb(
		ReportGenerateRequest request,
		String username,
		String downloadUrl
	) {
		return generate(request, null, resolveActor(username), downloadUrl);
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public GeneratedReportResponse generateFromQueue(
		ReportGenerateRequest request,
		Long tokenId,
		String tokenName,
		String downloadUrl
	) {
		return generate(request, tokenId, resolveActor(tokenName), downloadUrl);
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true)
	public BulkItemExport generateBytesForBulk(ReportGenerateRequest request) {
		Map<String, Object> requestParameters = request == null || request.parameters() == null ? Map.of() : request.parameters();
		if (request == null || (request.reportId() == null && (request.templateCode() == null || request.templateCode().isBlank()))) {
			throw new IllegalArgumentException("Report id or template code is required.");
		}

		OutputFormat outputFormat = OutputFormat.from(request.format());
		ReportTemplateService.ExecutedTemplate executedTemplate = request.reportId() != null
			? reportTemplateService.executeTemplate(request.reportId(), requestParameters)
			: reportTemplateService.executeTemplateByCode(request.templateCode(), requestParameters);
		byte[] content = export(executedTemplate.jasperPrint(), outputFormat);
		return new BulkItemExport(content, outputFormat.extension(), outputFormat.mediaType(), executedTemplate.templateName());
	}

	private GeneratedReportResponse generate(
		ReportGenerateRequest request,
		Long generatedByTokenId,
		String generatedByTokenName,
		String downloadUrl
	) {
		Map<String, Object> requestParameters = request == null || request.parameters() == null ? Map.of() : request.parameters();
		String actor = resolveActor(generatedByTokenName);

		try {
			if (request == null || (request.reportId() == null && (request.templateCode() == null || request.templateCode().isBlank()))) {
				throw new IllegalArgumentException("Report id or template code is required.");
			}

			OutputFormat outputFormat = OutputFormat.from(request.format());
			ReportTemplateService.ExecutedTemplate executedTemplate = request.reportId() != null
				? reportTemplateService.executeTemplate(request.reportId(), requestParameters)
				: reportTemplateService.executeTemplateByCode(request.templateCode(), requestParameters);
			byte[] content = export(executedTemplate.jasperPrint(), outputFormat);
			LocalDateTime generatedAt = LocalDateTime.now();
			ZoneId displayZoneId = timeDisplayService.currentDisplayZoneId();
			ensureReportsDirectory();

			Path storedFilePath = reportsOutputDirectory.resolve("report-" + UUID.randomUUID() + "." + outputFormat.extension()).normalize();
			writeStoredReport(storedFilePath, content);

			GeneratedReportFile generatedReportFile = new GeneratedReportFile();
			generatedReportFile.setReportTemplateId(executedTemplate.templateId());
			generatedReportFile.setReportTemplateName(executedTemplate.templateName());
			generatedReportFile.setOutputFormat(outputFormat.name().toLowerCase(Locale.ROOT));
			generatedReportFile.setDownloadFileName(buildDownloadFileName(executedTemplate.templateName(), timeDisplayService.toDisplayDateTime(generatedAt, displayZoneId), outputFormat.extension()));
			generatedReportFile.setStoragePath(storedFilePath.toString());
			generatedReportFile.setParametersJson(writeParameters(requestParameters));
			generatedReportFile.setFileSizeBytes(content.length);
			generatedReportFile.setGeneratedAt(generatedAt);
			generatedReportFile.setGeneratedByTokenId(generatedByTokenId);
			generatedReportFile.setGeneratedByTokenName(actor);
			generatedReportFile = generatedReportFileRepository.save(generatedReportFile);
			auditLogService.logReportGenerated(
				generatedReportFile.getReportTemplateName(),
				generatedReportFile.getDownloadFileName(),
				generatedReportFile.getGeneratedByTokenName(),
				requestParameters
			);

			return new GeneratedReportResponse(
				generatedReportFile.getId(),
				generatedReportFile.getReportTemplateId(),
				generatedReportFile.getReportTemplateName(),
				generatedReportFile.getOutputFormat(),
				generatedReportFile.getDownloadFileName(),
				downloadUrl,
				formatDateTime(generatedReportFile.getGeneratedAt(), displayZoneId)
			);
		} catch (RuntimeException exception) {
			auditLogService.logReportGenerationFailed(resolveAuditTarget(request), actor, requestParameters, sanitizeMessage(exception));
			throw exception;
		}
	}

	@Transactional
	public DownloadedReportFile downloadFromApi(long generatedReportId, AccessTokenService.ApiAccessToken apiAccessToken) {
		if (apiAccessToken == null) {
			throw new AccessTokenService.InvalidAccessTokenException("Access token is required.");
		}

		return download(generatedReportId, apiAccessToken.id(), apiAccessToken.tokenName());
	}

	@Transactional
	public DownloadedReportFile downloadFromWeb(long generatedReportId, String username) {
		String actor = username == null || username.isBlank() ? "Unknown User" : username.trim();
		return download(generatedReportId, null, actor);
	}

	private DownloadedReportFile download(long generatedReportId, Long downloadedByAccessTokenId, String downloadedBy) {
		GeneratedReportFile generatedReportFile = generatedReportFileRepository.findById(generatedReportId)
			.orElseThrow(() -> new GeneratedReportNotFoundException(generatedReportId));
		if (generatedReportFile.isFileDeleted()) {
			throw new GeneratedReportNotFoundException(generatedReportId, "Generated report " + generatedReportId + " is no longer available for download.");
		}

		byte[] content;
		try {
			content = readStoredReport(generatedReportFile.getStoragePath());
		} catch (IllegalArgumentException exception) {
			throw new GeneratedReportNotFoundException(generatedReportId, "Generated report " + generatedReportId + " is no longer available for download.");
		}
		generatedReportFile.setDownloadCount(generatedReportFile.getDownloadCount() + 1);
		generatedReportFile.setLastDownloadedAt(LocalDateTime.now());
		generatedReportFileRepository.save(generatedReportFile);

		ReportDownloadLog downloadLog = new ReportDownloadLog();
		downloadLog.setGeneratedReportFileId(generatedReportFile.getId());
		downloadLog.setDownloadFileName(generatedReportFile.getDownloadFileName());
		downloadLog.setReportTemplateName(generatedReportFile.getReportTemplateName());
		downloadLog.setDownloadedByAccessTokenId(downloadedByAccessTokenId);
		downloadLog.setDownloadedBy(downloadedBy);
		downloadLog.setDownloadedAt(LocalDateTime.now());
		reportDownloadLogRepository.save(downloadLog);
		auditLogService.logReportDownloaded(
			generatedReportFile.getReportTemplateName(),
			generatedReportFile.getDownloadFileName(),
			downloadedBy
		);

		return new DownloadedReportFile(
			generatedReportFile.getDownloadFileName(),
			OutputFormat.from(generatedReportFile.getOutputFormat()).mediaType(),
			content
		);
	}

	@Transactional(readOnly = true)
	public ReportsStats getStats() {
		ZoneId displayZoneId = timeDisplayService.currentDisplayZoneId();
		List<GeneratedReportFile> generatedFiles = generatedReportFileRepository.findAllByOrderByGeneratedAtDesc();
		String latestGenerated = generatedFiles.stream()
			.findFirst()
			.map(GeneratedReportFile::getGeneratedAt)
			.map(value -> formatDateTime(value, displayZoneId))
			.orElse("-");

		return new ReportsStats(generatedFiles.size(), reportDownloadLogRepository.count(), latestGenerated);
	}

	@Transactional(readOnly = true)
	public GeneratedReportFilePageResult getGeneratedFilesPage(Long reportTemplateId, int page, int size, String downloadUrlTemplate) {
		int safePage = Math.max(page, 0);
		int safeSize = Math.max(1, Math.min(size, 50));
		ZoneId displayZoneId = timeDisplayService.currentDisplayZoneId();
		List<GeneratedReportListItem> items = generatedReportFileRepository.findAllByOrderByGeneratedAtDesc().stream()
			.filter(file -> reportTemplateId == null || reportTemplateId.equals(file.getReportTemplateId()))
			.map(file -> toListItem(file, displayZoneId, downloadUrlTemplate))
			.toList();

		long totalItems = items.size();
		int totalPages = totalItems == 0 ? 0 : (int) Math.ceil((double) totalItems / safeSize);
		int resolvedPage = totalPages == 0 ? 0 : Math.min(safePage, totalPages - 1);
		int startIndex = Math.min(resolvedPage * safeSize, items.size());
		int endIndex = Math.min(startIndex + safeSize, items.size());

		PageImpl<GeneratedReportListItem> itemPage = new PageImpl<>(
			items.subList(startIndex, endIndex),
			PageRequest.of(resolvedPage, safeSize),
			totalItems
		);

		return new GeneratedReportFilePageResult(
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
	public ReportsPageData getPageData(int page, int size) {
		int safePage = Math.max(page, 0);
		int safeSize = Math.max(1, Math.min(size, 50));
		ZoneId displayZoneId = timeDisplayService.currentDisplayZoneId();
		List<GeneratedReportListItem> items = generatedReportFileRepository.findAllByOrderByGeneratedAtDesc().stream()
			.map(file -> toListItem(file, displayZoneId, null))
			.toList();

		long totalItems = items.size();
		int totalPages = totalItems == 0 ? 0 : (int) Math.ceil((double) totalItems / safeSize);
		int resolvedPage = totalPages == 0 ? 0 : Math.min(safePage, totalPages - 1);
		int startIndex = Math.min(resolvedPage * safeSize, items.size());
		int endIndex = Math.min(startIndex + safeSize, items.size());

		PageImpl<GeneratedReportListItem> itemPage = new PageImpl<>(
			items.subList(startIndex, endIndex),
			PageRequest.of(resolvedPage, safeSize),
			totalItems
		);

		List<ReportDownloadLogListItem> recentLogs = reportDownloadLogRepository.findTop25ByOrderByDownloadedAtDesc().stream()
			.map(log -> toLogListItem(log, displayZoneId))
			.toList();

		return new ReportsPageData(
			getStats(),
			itemPage.getContent(),
			itemPage.getTotalElements(),
			itemPage.getNumber(),
			itemPage.getSize(),
			itemPage.getTotalPages(),
			itemPage.hasPrevious(),
			itemPage.hasNext(),
			recentLogs
		);
	}

	@Transactional
	public int markGeneratedReportsDeleted(String deletionReason, LocalDateTime deletedAt) {
		LocalDateTime resolvedDeletedAt = deletedAt == null ? LocalDateTime.now() : deletedAt;
		List<GeneratedReportFile> files = generatedReportFileRepository.findAllByOrderByGeneratedAtDesc();
		int affectedCount = 0;
		for (GeneratedReportFile file : files) {
			if (file.isFileDeleted()) {
				continue;
			}

			deleteStoredReportIfExists(file.getStoragePath());
			file.setFileDeleted(true);
			file.setFileDeletedAt(resolvedDeletedAt);
			file.setFileDeletionReason(deletionReason);
			affectedCount++;
		}

		if (affectedCount > 0) {
			generatedReportFileRepository.saveAll(files);
		}

		return affectedCount;
	}

	@Transactional
	public int purgeGeneratedReports() {
		List<GeneratedReportFile> files = generatedReportFileRepository.findAllByOrderByGeneratedAtDesc();
		files.forEach(file -> deleteStoredReportIfExists(file.getStoragePath()));
		generatedReportFileRepository.deleteAllInBatch();
		return files.size();
	}

	private GeneratedReportListItem toListItem(GeneratedReportFile file, ZoneId displayZoneId, String downloadUrlTemplate) {
		String format = file.getOutputFormat().toUpperCase(Locale.ROOT);
		boolean downloadAvailable = !file.isFileDeleted();
		return new GeneratedReportListItem(
			file.getId(),
			file.getReportTemplateName(),
			file.getDownloadFileName(),
			format,
			formatBadgeClassFor(format),
			formatDateTime(file.getGeneratedAt(), displayZoneId),
			file.getGeneratedByTokenName(),
			Long.toString(file.getDownloadCount()),
			downloadAvailable ? resolveDownloadPath(downloadUrlTemplate, file.getId()) : "",
			downloadAvailable,
			downloadAvailable ? "Available" : "Deleted"
		);
	}

	private String resolveDownloadPath(String downloadUrlTemplate, long reportFileId) {
		if (downloadUrlTemplate == null || downloadUrlTemplate.isBlank()) {
			return "/reports/files/" + reportFileId + "/download";
		}

		return downloadUrlTemplate.replace("__id__", Long.toString(reportFileId));
	}

	private String formatBadgeClassFor(String format) {
		return switch (format == null ? "" : format.toUpperCase(Locale.ROOT)) {
			case "XLSX" -> "pill pill--success";
			case "DOCX" -> "pill pill--info";
			case "PDF" -> "pill pill--danger";
			default -> "pill pill--warning";
		};
	}

	private ReportDownloadLogListItem toLogListItem(ReportDownloadLog log, ZoneId displayZoneId) {
		return new ReportDownloadLogListItem(
			log.getGeneratedReportFileId(),
			log.getDownloadFileName(),
			log.getReportTemplateName(),
			log.getDownloadedBy(),
			formatDateTime(log.getDownloadedAt(), displayZoneId)
		);
	}

	private byte[] export(JasperPrint jasperPrint, OutputFormat outputFormat) {
		try {
			return switch (outputFormat) {
				case PDF -> JasperExportManager.exportReportToPdf(jasperPrint);
				case DOCX -> exportDocx(jasperPrint);
				case XLSX -> exportXlsx(jasperPrint);
			};
		} catch (JRException exception) {
			throw new IllegalArgumentException("Unable to export the generated report. " + sanitizeMessage(exception));
		}
	}

	private byte[] exportDocx(JasperPrint jasperPrint) throws JRException {
		ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
		SimpleOutputStreamExporterOutput exporterOutput = new SimpleOutputStreamExporterOutput(outputStream);
		JRDocxExporter exporter = new JRDocxExporter();
		try {
			exporter.setExporterInput(new SimpleExporterInput(jasperPrint));
			exporter.setExporterOutput(exporterOutput);
			exporter.exportReport();
			return outputStream.toByteArray();
		} finally {
			exporterOutput.close();
		}
	}

	private byte[] exportXlsx(JasperPrint jasperPrint) throws JRException {
		ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
		SimpleOutputStreamExporterOutput exporterOutput = new SimpleOutputStreamExporterOutput(outputStream);
		JRXlsxExporter exporter = new JRXlsxExporter();
		try {
			exporter.setExporterInput(new SimpleExporterInput(jasperPrint));
			exporter.setExporterOutput(exporterOutput);
			SimpleXlsxReportConfiguration configuration = new SimpleXlsxReportConfiguration();
			configuration.setDetectCellType(true);
			configuration.setOnePagePerSheet(false);
			configuration.setWhitePageBackground(false);
			exporter.setConfiguration(configuration);
			exporter.exportReport();
			return outputStream.toByteArray();
		} finally {
			exporterOutput.close();
		}
	}

	private void ensureReportsDirectory() {
		try {
			Files.createDirectories(reportsOutputDirectory);
		} catch (IOException exception) {
			throw new IllegalArgumentException("Unable to prepare the reports output directory. " + sanitizeMessage(exception));
		}
	}

	private void writeStoredReport(Path path, byte[] content) {
		try {
			Files.write(path, content, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING, StandardOpenOption.WRITE);
		} catch (IOException exception) {
			throw new IllegalArgumentException("Unable to store the generated report file. " + sanitizeMessage(exception));
		}
	}

	private void deleteStoredReportIfExists(String storagePath) {
		if (storagePath == null || storagePath.isBlank()) {
			return;
		}

		try {
			Files.deleteIfExists(Path.of(storagePath).toAbsolutePath().normalize());
		} catch (IOException ignored) {
			// Ignore cleanup failures so metadata cleanup can continue.
		}
	}

	private byte[] readStoredReport(String storagePath) {
		if (storagePath == null || storagePath.isBlank()) {
			throw new IllegalArgumentException("This generated report does not have a stored file.");
		}

		try {
			return Files.readAllBytes(Path.of(storagePath).toAbsolutePath().normalize());
		} catch (IOException exception) {
			throw new IllegalArgumentException("Unable to read the generated report file.");
		}
	}

	private String buildDownloadFileName(String templateName, LocalDateTime generatedAt, String extension) {
		String baseName = templateName == null ? "Report" : templateName.trim().replaceAll("[^A-Za-z0-9_-]", "_");
		if (baseName.isBlank()) {
			baseName = "Report";
		}
		return baseName + "-" + generatedAt.format(FILE_NAME_TIME_FORMAT) + "." + extension;
	}

	private String writeParameters(Map<String, Object> parameters) {
		try {
			return objectMapper.writeValueAsString(parameters == null ? Map.of() : parameters);
		} catch (JsonProcessingException exception) {
			throw new IllegalArgumentException("Unable to store generated report parameters. " + sanitizeMessage(exception));
		}
	}

	private String resolveAuditTarget(ReportGenerateRequest request) {
		if (request == null) {
			return "Unknown Report";
		}

		if (request.templateCode() != null && !request.templateCode().isBlank()) {
			return request.templateCode().trim();
		}

		if (request.reportId() != null) {
			return "Report #" + request.reportId();
		}

		return "Unknown Report";
	}

	private String sanitizeMessage(Exception exception) {
		String message = exception.getMessage();
		if (message == null || message.isBlank()) {
			return "The report engine returned an empty error message.";
		}

		message = message.replaceAll("\\s+", " ").trim();
		return message.length() > 180 ? message.substring(0, 177) + "..." : message;
	}

	private String formatDateTime(LocalDateTime value, ZoneId displayZoneId) {
		return timeDisplayService.formatStoredDateTime(value, displayZoneId);
	}

	private String resolveActor(String actor) {
		return actor == null || actor.isBlank() ? "Unknown User" : actor.trim();
	}

	public record ReportGenerateRequest(
		Long reportId,
		String templateCode,
		Map<String, Object> parameters,
		String format
	) {
	}

	public record GeneratedReportResponse(
		Long reportFileId,
		Long reportId,
		String reportTemplateName,
		String format,
		String fileName,
		String downloadUrl,
		String generatedAt
	) {
	}

	public record DownloadedReportFile(
		String fileName,
		MediaType mediaType,
		byte[] content
	) {
	}

	public record BulkItemExport(
		byte[] content,
		String extension,
		MediaType mediaType,
		String reportTemplateName
	) {
	}

	public record ReportsStats(
		long totalGenerated,
		long totalDownloads,
		String latestGenerated
	) {
	}

	public record GeneratedReportListItem(
		Long id,
		String reportTemplateName,
		String fileName,
		String format,
		String formatBadgeClass,
		String generatedAt,
		String generatedByToken,
		String downloadCount,
		String downloadPath,
		boolean downloadAvailable,
		String downloadStatus
	) {
	}

	public record ReportDownloadLogListItem(
		Long generatedReportFileId,
		String fileName,
		String reportTemplateName,
		String downloadedBy,
		String downloadedAt
	) {
	}

	public record ReportsPageData(
		ReportsStats stats,
		List<GeneratedReportListItem> reports,
		long totalItems,
		int pageNumber,
		int pageSize,
		int totalPages,
		boolean hasPrevious,
		boolean hasNext,
		List<ReportDownloadLogListItem> recentDownloads
	) {
	}

	public record GeneratedReportFilePageResult(
		List<GeneratedReportListItem> items,
		long totalItems,
		int pageNumber,
		int pageSize,
		int totalPages,
		boolean hasPrevious,
		boolean hasNext
	) {
	}

	public static class GeneratedReportNotFoundException extends RuntimeException {
		public GeneratedReportNotFoundException(long id) {
			super("Generated report " + id + " was not found.");
		}

		public GeneratedReportNotFoundException(long id, String message) {
			super(message == null || message.isBlank() ? "Generated report " + id + " was not found." : message);
		}
	}

	private enum OutputFormat {
		PDF("pdf", MediaType.APPLICATION_PDF),
		DOCX("docx", MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document")),
		XLSX("xlsx", MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));

		private final String extension;
		private final MediaType mediaType;

		OutputFormat(String extension, MediaType mediaType) {
			this.extension = extension;
			this.mediaType = mediaType;
		}

		public String extension() {
			return extension;
		}

		public MediaType mediaType() {
			return mediaType;
		}

		public static OutputFormat from(String value) {
			if (value == null || value.isBlank()) {
				return PDF;
			}

			return switch (value.trim().toLowerCase(Locale.ROOT)) {
				case "pdf" -> PDF;
				case "docx" -> DOCX;
				case "xlsx" -> XLSX;
				default -> throw new IllegalArgumentException("Report format is invalid. Supported formats are pdf, docx, xlsx.");
			};
		}
	}
}