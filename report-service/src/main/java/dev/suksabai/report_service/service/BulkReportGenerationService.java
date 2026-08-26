package dev.suksabai.report_service.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.suksabai.report_service.model.BulkReportGenerationBatch;
import dev.suksabai.report_service.repository.BulkReportGenerationBatchRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class BulkReportGenerationService {

	private static final DateTimeFormatter FILE_NAME_TIME_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");

	private final BulkReportGenerationBatchRepository repository;
	private final GeneratedReportService generatedReportService;
	private final AuditLogService auditLogService;
	private final ConfiguredTimeDisplayService timeDisplayService;
	private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
	private final Path bulkStorageDirectory;

	public BulkReportGenerationService(
		BulkReportGenerationBatchRepository repository,
		GeneratedReportService generatedReportService,
		AuditLogService auditLogService,
		ConfiguredTimeDisplayService timeDisplayService,
		@Value("${file.reports-bulk-dir:data/bulk}") String bulkStorageDirectory
	) {
		this.repository = repository;
		this.generatedReportService = generatedReportService;
		this.auditLogService = auditLogService;
		this.timeDisplayService = timeDisplayService;
		this.bulkStorageDirectory = Path.of(bulkStorageDirectory).toAbsolutePath().normalize();
	}

	@Transactional
	public BulkGenerationResult generateFromApi(List<BulkGenerateItem> items, AccessTokenService.ApiAccessToken apiAccessToken) {
		BulkOutcome outcome = performBulkGeneration(items, apiAccessToken == null ? null : apiAccessToken.id(), apiAccessToken == null ? null : apiAccessToken.tokenName());
		return new BulkGenerationResult(outcome.batch().getId(), outcome.batch().getZipFileName(), outcome.zipContent(), outcome.batch().getItemCount(), outcome.batch().getSuccessCount(), outcome.batch().getFailureCount());
	}

	@Transactional
	public BulkGenerationSummary generateFromWeb(List<BulkGenerateItem> items, String username) {
		BulkOutcome outcome = performBulkGeneration(items, null, username);
		return new BulkGenerationSummary(outcome.batch().getId(), outcome.batch().getItemCount(), outcome.batch().getSuccessCount(), outcome.batch().getFailureCount());
	}

	@Transactional(readOnly = true)
	public BulkBatchPageResult getPage(int page, int size) {
		int safePage = Math.max(page, 0);
		int safeSize = Math.max(1, Math.min(size, 50));
		ZoneId displayZoneId = timeDisplayService.currentDisplayZoneId();
		List<BulkBatchListItem> items = repository.findAllByOrderByGeneratedAtDesc().stream()
			.map(batch -> toListItem(batch, displayZoneId))
			.toList();

		long totalItems = items.size();
		int totalPages = totalItems == 0 ? 0 : (int) Math.ceil((double) totalItems / safeSize);
		int resolvedPage = totalPages == 0 ? 0 : Math.min(safePage, totalPages - 1);
		int startIndex = Math.min(resolvedPage * safeSize, items.size());
		int endIndex = Math.min(startIndex + safeSize, items.size());

		PageImpl<BulkBatchListItem> itemPage = new PageImpl<>(
			items.subList(startIndex, endIndex),
			PageRequest.of(resolvedPage, safeSize),
			totalItems
		);

		return new BulkBatchPageResult(
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
	public BulkBatchDetail getOne(long id) {
		BulkReportGenerationBatch batch = repository.findById(id)
			.orElseThrow(() -> new BulkBatchNotFoundException(id));
		return new BulkBatchDetail(toListItem(batch, timeDisplayService.currentDisplayZoneId()), readItemResults(batch.getItemResultsJson()));
	}

	@Transactional
	public DownloadedBulkBatch downloadBatch(long id) {
		BulkReportGenerationBatch batch = repository.findById(id)
			.orElseThrow(() -> new BulkBatchNotFoundException(id));
		byte[] content = readStoredZip(batch.getZipStoragePath());
		batch.setDownloadCount(batch.getDownloadCount() + 1);
		batch.setLastDownloadedAt(LocalDateTime.now());
		repository.save(batch);
		auditLogService.logEvent("Bulk Report Downloaded", "Downloaded bulk batch #" + batch.getId() + " (" + batch.getZipFileName() + ").", null, "Bulk Report Batch #" + batch.getId(), "Completed");
		return new DownloadedBulkBatch(batch.getZipFileName(), content);
	}

	private BulkOutcome performBulkGeneration(List<BulkGenerateItem> items, Long tokenId, String actorName) {
		if (items == null || items.isEmpty()) {
			throw new IllegalArgumentException("At least one bulk generation item is required.");
		}

		String actor = resolveActor(actorName);
		List<BulkItemResult> itemResults = new ArrayList<>();
		Set<String> usedFileNames = new HashSet<>();
		ByteArrayOutputStream zipBuffer = new ByteArrayOutputStream();

		try (ZipOutputStream zipOutputStream = new ZipOutputStream(zipBuffer)) {
			int index = 0;
			for (BulkGenerateItem item : items) {
				index++;
				String templateRef = describeTemplateRef(item, index);
				try {
					GeneratedReportService.BulkItemExport exported = generatedReportService.generateBytesForBulk(new GeneratedReportService.ReportGenerateRequest(
						item.reportId(),
						item.templateCode(),
						item.parameters(),
						item.format()
					));
					String fileName = resolveFileName(item.fileName(), exported.extension(), index, usedFileNames);
					writeZipEntry(zipOutputStream, fileName, exported.content());
					itemResults.add(new BulkItemResult(fileName, templateRef, "Success", null));
				} catch (RuntimeException exception) {
					itemResults.add(new BulkItemResult(item.fileName(), templateRef, "Failed", sanitizeMessage(exception.getMessage())));
				}
			}

			writeZipEntry(zipOutputStream, "manifest.json", objectMapper.writeValueAsBytes(itemResults));
		} catch (IOException exception) {
			throw new IllegalArgumentException("Unable to build the bulk report ZIP file.");
		}

		byte[] zipContent = zipBuffer.toByteArray();
		int successCount = (int) itemResults.stream().filter(result -> "Success".equals(result.status())).count();
		int failureCount = itemResults.size() - successCount;

		ensureBulkDirectory();
		String zipFileName = "bulk-report-" + LocalDateTime.now().format(FILE_NAME_TIME_FORMAT) + ".zip";
		Path zipPath = bulkStorageDirectory.resolve("bulk-" + UUID.randomUUID() + ".zip").normalize();
		writeStoredZip(zipPath, zipContent);

		BulkReportGenerationBatch batch = new BulkReportGenerationBatch();
		batch.setRequestedByTokenId(tokenId);
		batch.setRequestedByTokenName(actor);
		batch.setItemCount(itemResults.size());
		batch.setSuccessCount(successCount);
		batch.setFailureCount(failureCount);
		batch.setItemResultsJson(writeItemResults(itemResults));
		batch.setZipFileName(zipFileName);
		batch.setZipStoragePath(zipPath.toString());
		batch.setZipFileSizeBytes(zipContent.length);
		batch = repository.save(batch);

		auditLogService.logEvent(
			"Bulk Report Generated",
			"Generated " + successCount + "/" + itemResults.size() + " report(s) in a bulk batch.",
			actor,
			"Bulk Report Batch #" + batch.getId(),
			successCount == 0 ? "Failed" : "Completed"
		);

		return new BulkOutcome(batch, zipContent);
	}

	private String describeTemplateRef(BulkGenerateItem item, int index) {
		if (item.templateCode() != null && !item.templateCode().isBlank()) {
			return "templateCode:" + item.templateCode().trim();
		}

		if (item.reportId() != null) {
			return "reportId:" + item.reportId();
		}

		return "item-" + index;
	}

	private String resolveFileName(String requestedFileName, String extension, int index, Set<String> usedFileNames) {
		String baseName = requestedFileName == null || requestedFileName.isBlank() ? "report-" + index : requestedFileName.trim();
		String sanitized = baseName.replaceAll("[^A-Za-z0-9._-]", "_");
		String suffix = "." + extension;
		if (!sanitized.toLowerCase(java.util.Locale.ROOT).endsWith(suffix)) {
			sanitized = sanitized + suffix;
		}

		String candidate = sanitized;
		int attempt = 1;
		while (!usedFileNames.add(candidate)) {
			attempt++;
			String stem = sanitized.substring(0, sanitized.length() - suffix.length());
			candidate = stem + "-" + attempt + suffix;
		}

		return candidate;
	}

	private void writeZipEntry(ZipOutputStream zipOutputStream, String entryName, byte[] content) throws IOException {
		zipOutputStream.putNextEntry(new ZipEntry(entryName));
		zipOutputStream.write(content);
		zipOutputStream.closeEntry();
	}

	private BulkBatchListItem toListItem(BulkReportGenerationBatch batch, ZoneId displayZoneId) {
		return new BulkBatchListItem(
			batch.getId(),
			batch.getRequestedByTokenName(),
			batch.getItemCount(),
			batch.getSuccessCount(),
			batch.getFailureCount(),
			timeDisplayService.formatStoredDateTime(batch.getGeneratedAt(), displayZoneId),
			batch.getDownloadCount(),
			batch.getZipFileName()
		);
	}

	private void ensureBulkDirectory() {
		try {
			Files.createDirectories(bulkStorageDirectory);
		} catch (IOException exception) {
			throw new IllegalArgumentException("Unable to prepare the bulk report storage directory.");
		}
	}

	private void writeStoredZip(Path path, byte[] content) {
		try {
			Files.write(path, content, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING, StandardOpenOption.WRITE);
		} catch (IOException exception) {
			throw new IllegalArgumentException("Unable to store the bulk report ZIP file.");
		}
	}

	private byte[] readStoredZip(String storagePath) {
		if (storagePath == null || storagePath.isBlank()) {
			throw new IllegalArgumentException("This bulk batch does not have a stored ZIP file.");
		}

		try {
			return Files.readAllBytes(Path.of(storagePath).toAbsolutePath().normalize());
		} catch (IOException exception) {
			throw new IllegalArgumentException("Unable to read the bulk report ZIP file.");
		}
	}

	private String writeItemResults(List<BulkItemResult> itemResults) {
		try {
			return objectMapper.writeValueAsString(itemResults);
		} catch (JsonProcessingException exception) {
			throw new IllegalArgumentException("Unable to store the bulk report item results.");
		}
	}

	private List<BulkItemResult> readItemResults(String itemResultsJson) {
		if (itemResultsJson == null || itemResultsJson.isBlank()) {
			return List.of();
		}

		try {
			return objectMapper.readValue(itemResultsJson, new TypeReference<List<BulkItemResult>>() {
			});
		} catch (JsonProcessingException exception) {
			throw new IllegalArgumentException("Unable to read the bulk report item results.");
		}
	}

	private String resolveActor(String actor) {
		return actor == null || actor.isBlank() ? "Unknown User" : actor.trim();
	}

	private String sanitizeMessage(String message) {
		if (message == null || message.isBlank()) {
			return "The report engine returned an empty error message.";
		}

		String normalized = message.replaceAll("\\s+", " ").trim();
		return normalized.length() > 180 ? normalized.substring(0, 177) + "..." : normalized;
	}

	public record BulkGenerateItem(
		Long reportId,
		String templateCode,
		java.util.Map<String, Object> parameters,
		String format,
		String fileName
	) {
	}

	public record BulkGenerationResult(
		Long batchId,
		String zipFileName,
		byte[] zipContent,
		int itemCount,
		int successCount,
		int failureCount
	) {
	}

	public record BulkGenerationSummary(
		Long batchId,
		int itemCount,
		int successCount,
		int failureCount
	) {
	}

	public record BulkItemResult(
		String fileName,
		String templateRef,
		String status,
		String message
	) {
	}

	public record BulkBatchListItem(
		Long id,
		String requestedBy,
		int itemCount,
		int successCount,
		int failureCount,
		String generatedAt,
		long downloadCount,
		String zipFileName
	) {
	}

	public record BulkBatchPageResult(
		List<BulkBatchListItem> items,
		long totalItems,
		int pageNumber,
		int pageSize,
		int totalPages,
		boolean hasPrevious,
		boolean hasNext
	) {
	}

	public record BulkBatchDetail(
		BulkBatchListItem summary,
		List<BulkItemResult> items
	) {
	}

	public record DownloadedBulkBatch(
		String fileName,
		byte[] content
	) {
	}

	private record BulkOutcome(
		BulkReportGenerationBatch batch,
		byte[] zipContent
	) {
	}

	public static class BulkBatchNotFoundException extends RuntimeException {
		public BulkBatchNotFoundException(long id) {
			super("Bulk report batch " + id + " was not found.");
		}
	}
}
