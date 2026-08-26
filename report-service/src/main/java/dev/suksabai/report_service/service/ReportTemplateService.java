package dev.suksabai.report_service.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.suksabai.report_service.model.DataSourceConfig;
import dev.suksabai.report_service.model.ReportTemplate;
import dev.suksabai.report_service.repository.DataSourceConfigRepository;
import dev.suksabai.report_service.repository.ReportTemplateRepository;
import net.sf.jasperreports.engine.JRDataSource;
import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.JREmptyDataSource;
import net.sf.jasperreports.engine.JRParameter;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.design.JRDesignQuery;
import net.sf.jasperreports.engine.design.JasperDesign;
import net.sf.jasperreports.engine.xml.JRXmlLoader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.lang.reflect.Array;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReportTemplateService {
	private static final Logger logger = LoggerFactory.getLogger(ReportTemplateService.class);

	private static final List<String> DATE_TYPE_NAMES = List.of(
		"java.time.LocalDate",
		"java.time.LocalDateTime",
		"java.util.Date",
		"java.sql.Date",
		"java.sql.Timestamp"
	);

	private static final List<String> COLLECTION_TYPE_NAMES = List.of(
		"java.util.Collection",
		"java.util.List",
		"java.util.ArrayList",
		"java.util.LinkedList",
		"java.util.Set",
		"java.util.HashSet",
		"java.util.LinkedHashSet",
		"java.lang.Iterable"
	);

	private final ReportTemplateRepository repository;
	private final DataSourceConfigRepository dataSourceRepository;
	private final AuditLogService auditLogService;
	private final dev.suksabai.report_service.service.ConfiguredTimeDisplayService timeDisplayService;
	private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
	private final Path reportsUploadDirectory;
	private final Path reportsGeneratedDirectory;

	public ReportTemplateService(
		ReportTemplateRepository repository,
		DataSourceConfigRepository dataSourceRepository,
		AuditLogService auditLogService,
		dev.suksabai.report_service.service.ConfiguredTimeDisplayService timeDisplayService,
		@Value("${file.reports-uploads-dir:data/uploads}") String reportsUploadsDirectory,
		@Value("${file.reports-generated-dir:data/generated}") String reportsGeneratedDirectory
	) {
		this.repository = repository;
		this.dataSourceRepository = dataSourceRepository;
		this.auditLogService = auditLogService;
		this.timeDisplayService = timeDisplayService;
		this.reportsUploadDirectory = Path.of(reportsUploadsDirectory).toAbsolutePath().normalize();
		this.reportsGeneratedDirectory = Path.of(reportsGeneratedDirectory).toAbsolutePath().normalize();
	}

	@Transactional(readOnly = true)
	public List<ReportTemplateListItem> getAllSummaries() {
		ZoneId displayZoneId = timeDisplayService.currentDisplayZoneId();
		return repository.findAllByOrderByUpdatedAtDesc().stream()
			.map(template -> toListItem(template, displayZoneId))
			.toList();
	}

	@Transactional(readOnly = true)
	public ReportTemplatePageResult getPage(int page, int size) {
		int safePage = Math.max(page, 0);
		int safeSize = Math.max(1, Math.min(size, 50));
		List<ReportTemplateListItem> items = getAllSummaries();
		long totalItems = items.size();
		int totalPages = totalItems == 0 ? 0 : (int) Math.ceil((double) totalItems / safeSize);
		int resolvedPage = totalPages == 0 ? 0 : Math.min(safePage, totalPages - 1);
		int startIndex = Math.min(resolvedPage * safeSize, items.size());
		int endIndex = Math.min(startIndex + safeSize, items.size());

		return new ReportTemplatePageResult(
			items.subList(startIndex, endIndex),
			totalItems,
			resolvedPage,
			safeSize,
			totalPages,
			resolvedPage > 0,
			totalPages > 0 && resolvedPage < totalPages - 1
		);
	}

	@Transactional(readOnly = true)
	public ReportTemplateStats getStats() {
		ZoneId displayZoneId = timeDisplayService.currentDisplayZoneId();
		List<ReportTemplate> templates = repository.findAll();
		String mostActiveSource = templates.stream()
			.map(ReportTemplate::getDataSourceConfig)
			.filter(java.util.Objects::nonNull)
			.collect(Collectors.groupingBy(DataSourceConfig::getConnectionLabel, Collectors.counting()))
			.entrySet().stream()
			.max(Map.Entry.<String, Long>comparingByValue().thenComparing(Map.Entry.comparingByKey()))
			.map(Map.Entry::getKey)
			.orElse("-");

		String lastUpload = templates.stream()
			.map(ReportTemplate::getUploadedAt)
			.filter(java.util.Objects::nonNull)
			.max(Comparator.naturalOrder())
			.map(value -> formatDateTime(value, displayZoneId))
			.orElse("-");

		return new ReportTemplateStats(templates.size(), mostActiveSource, lastUpload);
	}

	@Transactional(readOnly = true)
	public boolean exists(long id) {
		return repository.existsById(id);
	}

	@Transactional(readOnly = true)
	public ReportTemplatePayload getTemplate(long id) {
		ZoneId displayZoneId = timeDisplayService.currentDisplayZoneId();
		return repository.findById(id)
			.map(template -> toPayload(template, displayZoneId))
			.orElseThrow(() -> new ReportTemplateNotFoundException(id));
	}

	@Transactional
	public ReportTemplatePayload create(ReportTemplateSaveRequest request) {
		ReportTemplate template = new ReportTemplate();
		PendingTemplateFiles pendingFiles = applyRequest(template, request, true);
		ReportTemplate savedTemplate = repository.save(template);
		cleanupTemplateFiles(pendingFiles.pathsToDelete());
		auditLogService.logAdminAction(
			"Report Template Created",
			"Created template " + savedTemplate.getTemplateName(),
			savedTemplate.getTemplateName()
		);
		return toPayload(savedTemplate, timeDisplayService.currentDisplayZoneId());
	}

	@Transactional
	public ReportTemplatePayload update(long id, ReportTemplateSaveRequest request) {
		ReportTemplate template = repository.findById(id)
			.orElseThrow(() -> new ReportTemplateNotFoundException(id));
		PendingTemplateFiles pendingFiles = applyRequest(template, request, false);
		ReportTemplate savedTemplate = repository.save(template);
		cleanupTemplateFiles(pendingFiles.pathsToDelete());
		auditLogService.logAdminAction(
			"Report Template Updated",
			"Updated template " + savedTemplate.getTemplateName(),
			savedTemplate.getTemplateName()
		);
		return toPayload(savedTemplate, timeDisplayService.currentDisplayZoneId());
	}

	@Transactional
	public void delete(long id) {
		ReportTemplate template = repository.findById(id)
			.orElseThrow(() -> new ReportTemplateNotFoundException(id));
		String templateName = template.getTemplateName();
		List<Path> storedFiles = storedTemplatePaths(template);
		repository.delete(template);
		cleanupTemplateFiles(storedFiles);
		auditLogService.logAdminAction(
			"Report Template Deleted",
			"Deleted template " + templateName,
			templateName
		);
	}

	public ReportTemplateUploadResponse uploadJrxml(MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new IllegalArgumentException("JRXML file is required.");
		}

		String originalFileName = file.getOriginalFilename() == null ? "template.jrxml" : file.getOriginalFilename().trim();
		if (!originalFileName.toLowerCase(Locale.ROOT).endsWith(".jrxml")) {
			throw new IllegalArgumentException("Only .jrxml files can be uploaded.");
		}

		try {
			CompiledTemplateArtifact compiledTemplate = compileTemplate(originalFileName, file.getBytes());
			String uploadToken = UUID.randomUUID().toString();
			LocalDateTime uploadedAt = LocalDateTime.now();
			UploadedTemplateAsset stagedUpload = stageUpload(uploadToken, compiledTemplate, uploadedAt);
			ZoneId displayZoneId = timeDisplayService.currentDisplayZoneId();

			return new ReportTemplateUploadResponse(
				stagedUpload.uploadToken(),
				stagedUpload.originalFileName(),
				stagedUpload.parameters(),
				formatDateTime(stagedUpload.uploadedAt(), displayZoneId)
			);
		} catch (IOException exception) {
			throw new IllegalArgumentException("Unable to read the uploaded JRXML file.");
		}
	}

	@Transactional(readOnly = true)
	public byte[] preview(ReportTemplatePreviewRequest request) {
		Map<String, Object> rawParameters = request == null || request.parameters() == null ? Map.of() : request.parameters();
		String auditTarget = resolvePreviewAuditTarget(request);

		try {
			PreviewContext previewContext = resolvePreviewContext(request);
			auditTarget = previewContext.auditTarget();
			Map<String, Object> parameters = toParameterValues(previewContext.parameterDefinitions(), rawParameters);
			JasperPrint jasperPrint = fillReport(previewContext.report(), parameters, previewContext.dataSourceConfig());
			byte[] pdf = JasperExportManager.exportReportToPdf(jasperPrint);
			auditLogService.logReportPreviewed(auditTarget, rawParameters);
			return pdf;
		} catch (JRException | SQLException exception) {
			String message = "Unable to generate the report preview. " + sanitizeMessage(exception);
			auditLogService.logReportPreviewFailed(auditTarget, rawParameters, message);
			throw new IllegalArgumentException(message);
		} catch (RuntimeException exception) {
			auditLogService.logReportPreviewFailed(auditTarget, rawParameters, sanitizeRuntimeMessage(exception));
			throw exception;
		}
	}

	@Transactional(readOnly = true)
	public ExecutedTemplate executeTemplate(long templateId, Map<String, Object> rawParameters) {
		ReportTemplate template = repository.findById(templateId)
			.orElseThrow(() -> new ReportTemplateNotFoundException(templateId));
		return executeTemplate(template, rawParameters);
	}

	@Transactional(readOnly = true)
	public ExecutedTemplate executeTemplateByCode(String templateCode, Map<String, Object> rawParameters) {
		String normalizedTemplateCode = normalizeTemplateCode(templateCode);
		if (normalizedTemplateCode.isBlank()) {
			throw new IllegalArgumentException("Template code is required.");
		}

		ReportTemplate template = repository.findByTemplateCodeIgnoreCase(normalizedTemplateCode)
			.orElseThrow(() -> new IllegalArgumentException("Report template code was not found."));
		return executeTemplate(template, rawParameters);
	}

	private ExecutedTemplate executeTemplate(ReportTemplate template, Map<String, Object> rawParameters) {

		List<ParameterDefinition> parameterDefinitions = readParameterSchema(template.getParameterSchemaJson());
		Map<String, Object> parameters = toParameterValues(parameterDefinitions, rawParameters);

		try {
			JasperPrint jasperPrint = fillReport(
				readJasperReport(readStoredTemplateFile(template.getJasperStoragePath(), "compiled Jasper report")),
				parameters,
				template.getDataSourceConfig()
			);
			return new ExecutedTemplate(template.getId(), template.getTemplateName(), jasperPrint);
		} catch (JRException | SQLException exception) {
			throw new IllegalArgumentException("Unable to generate the report. " + sanitizeMessage(exception));
		}
	}

	@Transactional(readOnly = true)
	public TemplateRef findTemplateSummary(Long reportId, String templateCode) {
		if (reportId != null) {
			ReportTemplate template = repository.findById(reportId)
				.orElseThrow(() -> new ReportTemplateNotFoundException(reportId));
			return new TemplateRef(template.getId(), template.getTemplateName());
		}

		String normalizedTemplateCode = normalizeTemplateCode(templateCode);
		if (normalizedTemplateCode.isBlank()) {
			throw new IllegalArgumentException("Report id or template code is required.");
		}

		ReportTemplate template = repository.findByTemplateCodeIgnoreCase(normalizedTemplateCode)
			.orElseThrow(() -> new IllegalArgumentException("Report template code was not found."));
		return new TemplateRef(template.getId(), template.getTemplateName());
	}

	@Transactional(readOnly = true)
	public DownloadedTemplateFile downloadJrxml(Long templateId, String uploadToken) {
		if (uploadToken != null && !uploadToken.isBlank()) {
			UploadedTemplateAsset uploadAsset = loadStagedUpload(uploadToken);
			return new DownloadedTemplateFile(
				uploadAsset.originalFileName(),
				readFileBytes(uploadAsset.jrxmlPath(), "uploaded JRXML file")
			);
		}

		if (templateId == null) {
			throw new IllegalArgumentException("Template id or upload token is required.");
		}

		ReportTemplate template = repository.findById(templateId)
			.orElseThrow(() -> new ReportTemplateNotFoundException(templateId));

		return new DownloadedTemplateFile(
			template.getOriginalFileName(),
			readStoredTemplateFile(template.getJrxmlStoragePath(), "stored JRXML file")
		);
	}

	private PendingTemplateFiles applyRequest(ReportTemplate template, ReportTemplateSaveRequest request, boolean requireUpload) {
		String templateCode = normalizeTemplateCode(request.templateCode());
		validateUniqueTemplateCode(template.getId(), templateCode);
		template.setTemplateCode(templateCode);
		template.setTemplateName(requireText(request.templateName(), "Template Name"));
		template.setDescription(normalizeOptionalText(request.description()));
		template.setDataSourceConfig(resolveOptionalDataSource(request.dataSourceId()));
		List<Path> staleFiles = List.of();

		UploadedTemplateAsset uploadAsset = null;
		if (request.uploadToken() != null && !request.uploadToken().isBlank()) {
			uploadAsset = loadStagedUpload(request.uploadToken());
		}

		if (uploadAsset != null) {
			StoredTemplateFiles storedFiles = persistUploadedTemplate(uploadAsset);
			staleFiles = storedTemplatePaths(template);
			template.setOriginalFileName(uploadAsset.originalFileName());
			template.setJrxmlStoragePath(storedFiles.jrxmlPath().toString());
			template.setJasperStoragePath(storedFiles.jasperPath().toString());
			template.setParameterSchemaJson(writeParameterSchema(uploadAsset.parameters()));
			template.setUploadedAt(uploadAsset.uploadedAt());
			deleteStagedUpload(uploadAsset);
			return new PendingTemplateFiles(staleFiles);
		}

		if (requireUpload && !hasStoredTemplateFiles(template)) {
			throw new IllegalArgumentException("Upload a JRXML file before saving the template.");
		}

		if (!hasStoredTemplateFiles(template) || template.getOriginalFileName() == null || template.getParameterSchemaJson() == null) {
			throw new IllegalArgumentException("This template does not have a compiled JRXML file yet.");
		}

		return new PendingTemplateFiles(List.of());
	}

	private PreviewContext resolvePreviewContext(ReportTemplatePreviewRequest request) {
		if (request == null) {
			throw new IllegalArgumentException("Preview request is required.");
		}

		if (request.uploadToken() != null && !request.uploadToken().isBlank()) {
			UploadedTemplateAsset uploadAsset = loadStagedUpload(request.uploadToken());

			return new PreviewContext(
				readJasperReport(readFileBytes(uploadAsset.jasperPath(), "compiled Jasper report")),
				resolveOptionalDataSource(request.dataSourceId()),
				uploadAsset.parameters(),
				uploadAsset.originalFileName()
			);
		}

		if (request.templateId() == null) {
			throw new IllegalArgumentException("Save the template or upload a JRXML file before previewing.");
		}

		ReportTemplate template = repository.findById(request.templateId())
			.orElseThrow(() -> new ReportTemplateNotFoundException(request.templateId()));

		return new PreviewContext(
			readJasperReport(readStoredTemplateFile(template.getJasperStoragePath(), "compiled Jasper report")),
			request.dataSourceId() == null ? template.getDataSourceConfig() : resolveOptionalDataSource(request.dataSourceId()),
			readParameterSchema(template.getParameterSchemaJson()),
			template.getTemplateName()
		);
	}

	private String resolvePreviewAuditTarget(ReportTemplatePreviewRequest request) {
		if (request == null) {
			return "Report Preview";
		}

		if (request.templateId() != null) {
			return "Report #" + request.templateId();
		}

		if (request.uploadToken() != null && !request.uploadToken().isBlank()) {
			return "Upload " + request.uploadToken().trim();
		}

		return "Report Preview";
	}

	private JasperPrint fillReport(JasperReport report, Map<String, Object> parameters, DataSourceConfig dataSourceConfig) throws JRException, SQLException {
		String queryText = report.getMainDataset() == null || report.getMainDataset().getQuery() == null ? "" : report.getMainDataset().getQuery().getText();
		if (queryText == null || queryText.isBlank()) {
			JRDataSource dataSource = new JREmptyDataSource(1);
			return JasperFillManager.fillReport(report, parameters, dataSource);
		}

		if (dataSourceConfig == null) {
			throw new IllegalArgumentException("Select a data source before generating a report that runs a database query.");
		}

		DriverManager.setLoginTimeout(JdbcUrlFactory.resolveConnectTimeoutSeconds(dataSourceConfig));
		try (Connection connection = DriverManager.getConnection(buildJdbcUrl(dataSourceConfig), dataSourceConfig.getUsername(), dataSourceConfig.getPassword())) {
			return JasperFillManager.fillReport(report, parameters, connection);
		}
	}

	private CompiledTemplateArtifact compileTemplate(String originalFileName, byte[] jrxmlContent) {
		try {
			JasperDesign jasperDesign = JRXmlLoader.load(new ByteArrayInputStream(jrxmlContent));
			if (jasperDesign.getQuery() == null) {
				jasperDesign.setQuery(new JRDesignQuery());
			}
			JasperReport jasperReport = JasperCompileManager.compileReport(jasperDesign);
			List<ParameterDefinition> parameterDefinitions = Arrays.stream(jasperReport.getParameters())
				.filter(parameter -> !parameter.isSystemDefined())
				.filter(JRParameter::isForPrompting)
				.map(parameter -> toParameterDefinition(parameter.getName(), parameter.getValueClassName()))
				.toList();

			return new CompiledTemplateArtifact(
				originalFileName,
				jrxmlContent,
				writeJasperReport(jasperReport),
				parameterDefinitions
			);
		} catch (JRException exception) {
			logger.error("Failed to compile JRXML file: {}", originalFileName, exception);
			throw new IllegalArgumentException("Unable to compile the JRXML file. " + sanitizeMessage(exception));
		}
	}

	private UploadedTemplateAsset stageUpload(String uploadToken, CompiledTemplateArtifact compiledTemplate, LocalDateTime uploadedAt) {
		ensureStorageDirectories();
		String safeOriginalFileName = sanitizeFileName(compiledTemplate.originalFileName());
		String stagedJrxmlFileName = uploadToken + "-" + safeOriginalFileName;
		String stagedJasperFileName = uploadToken + ".jasper";
		Path jrxmlPath = reportsUploadDirectory.resolve(stagedJrxmlFileName);
		Path jasperPath = reportsGeneratedDirectory.resolve(stagedJasperFileName);
		Path metadataPath = metadataPath(uploadToken);

		try {
			Files.write(jrxmlPath, compiledTemplate.jrxmlContent(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING, StandardOpenOption.WRITE);
			Files.write(jasperPath, compiledTemplate.jasperContent(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING, StandardOpenOption.WRITE);
			UploadMetadata metadata = new UploadMetadata(
				uploadToken,
				compiledTemplate.originalFileName(),
				stagedJrxmlFileName,
				stagedJasperFileName,
				compiledTemplate.parameters(),
				uploadedAt
			);
			objectMapper.writeValue(metadataPath.toFile(), metadata);
			return new UploadedTemplateAsset(
				uploadToken,
				compiledTemplate.originalFileName(),
				jrxmlPath,
				jasperPath,
				compiledTemplate.parameters(),
				uploadedAt,
				metadataPath
			);
		} catch (IOException exception) {
			deleteIfExists(jrxmlPath);
			deleteIfExists(jasperPath);
			deleteIfExists(metadataPath);
			throw new IllegalArgumentException("Unable to store the uploaded JRXML file.");
		}
	}

	private StoredTemplateFiles persistUploadedTemplate(UploadedTemplateAsset uploadAsset) {
		ensureStorageDirectories();
		String storageKey = UUID.randomUUID().toString();
		String fileExtension = extensionFor(uploadAsset.originalFileName(), ".jrxml");
		Path storedJrxmlPath = reportsUploadDirectory.resolve("template-" + storageKey + fileExtension).normalize();
		Path storedJasperPath = reportsGeneratedDirectory.resolve("template-" + storageKey + ".jasper").normalize();

		try {
			Files.move(uploadAsset.jrxmlPath(), storedJrxmlPath);
			Files.move(uploadAsset.jasperPath(), storedJasperPath);
			return new StoredTemplateFiles(storedJrxmlPath, storedJasperPath);
		} catch (IOException exception) {
			deleteIfExists(storedJrxmlPath);
			deleteIfExists(storedJasperPath);
			throw new IllegalArgumentException("Unable to persist the uploaded JRXML file.");
		}
	}

	private UploadedTemplateAsset loadStagedUpload(String uploadToken) {
		String sanitizedToken = requireUploadToken(uploadToken);
		Path metadataPath = metadataPath(sanitizedToken);
		if (!Files.exists(metadataPath)) {
			throw new IllegalArgumentException("The uploaded JRXML file is no longer available. Upload the file again.");
		}

		try {
			UploadMetadata metadata = objectMapper.readValue(metadataPath.toFile(), UploadMetadata.class);
			Path jrxmlPath = reportsUploadDirectory.resolve(metadata.stagedJrxmlFileName()).normalize();
			Path jasperPath = reportsGeneratedDirectory.resolve(metadata.stagedJasperFileName()).normalize();
			if (!Files.exists(jrxmlPath) || !Files.exists(jasperPath)) {
				throw new IllegalArgumentException("The uploaded JRXML file is incomplete. Upload the file again.");
			}

			return new UploadedTemplateAsset(
				metadata.uploadToken(),
				metadata.originalFileName(),
				jrxmlPath,
				jasperPath,
				metadata.parameters(),
				metadata.uploadedAt(),
				metadataPath
			);
		} catch (IOException exception) {
			throw new IllegalArgumentException("Unable to read the uploaded JRXML file. Upload the file again.");
		}
	}

	private void deleteStagedUpload(UploadedTemplateAsset uploadAsset) {
		deleteIfExists(uploadAsset.jrxmlPath());
		deleteIfExists(uploadAsset.jasperPath());
		deleteIfExists(uploadAsset.metadataPath());
	}

	private byte[] readFileBytes(Path path, String label) {
		try {
			return Files.readAllBytes(path);
		} catch (IOException exception) {
			throw new IllegalArgumentException("Unable to read the " + label + ".");
		}
	}

	private byte[] readStoredTemplateFile(String storagePath, String label) {
		if (storagePath == null || storagePath.isBlank()) {
			throw new IllegalArgumentException("This template does not have a stored " + label + ".");
		}

		return readFileBytes(Path.of(storagePath).toAbsolutePath().normalize(), label);
	}

	private void ensureStorageDirectories() {
		try {
			Files.createDirectories(reportsUploadDirectory);
			Files.createDirectories(reportsGeneratedDirectory);
		} catch (IOException exception) {
			throw new IllegalArgumentException("Unable to prepare the report upload directories.");
		}
	}

	private Path metadataPath(String uploadToken) {
		return reportsGeneratedDirectory.resolve(requireUploadToken(uploadToken) + ".json").normalize();
	}

	private String requireUploadToken(String uploadToken) {
		if (uploadToken == null || uploadToken.isBlank()) {
			throw new IllegalArgumentException("Upload token is required.");
		}

		String trimmedToken = uploadToken.trim();
		if (!trimmedToken.matches("[A-Za-z0-9-]+")) {
			throw new IllegalArgumentException("Upload token is invalid.");
		}

		return trimmedToken;
	}

	private String sanitizeFileName(String fileName) {
		String leafName = Path.of(fileName).getFileName().toString().trim();
		String sanitized = leafName.replaceAll("[^A-Za-z0-9._-]", "_");
		return sanitized.isBlank() ? "template.jrxml" : sanitized;
	}

	private void deleteIfExists(Path path) {
		try {
			Files.deleteIfExists(path);
		} catch (IOException ignored) {
			// Ignore cleanup failures for staged uploads.
		}
	}

	private void cleanupTemplateFiles(List<Path> paths) {
		paths.forEach(this::deleteIfExists);
	}

	private boolean hasStoredTemplateFiles(ReportTemplate template) {
		return template.getJrxmlStoragePath() != null && !template.getJrxmlStoragePath().isBlank()
			&& template.getJasperStoragePath() != null && !template.getJasperStoragePath().isBlank();
	}

	private List<Path> storedTemplatePaths(ReportTemplate template) {
		if (!hasStoredTemplateFiles(template)) {
			return List.of();
		}

		return List.of(
			Path.of(template.getJrxmlStoragePath()).toAbsolutePath().normalize(),
			Path.of(template.getJasperStoragePath()).toAbsolutePath().normalize()
		);
	}

	private String extensionFor(String fileName, String fallbackExtension) {
		String safeFileName = sanitizeFileName(fileName);
		int extensionIndex = safeFileName.lastIndexOf('.');
		if (extensionIndex < 0) {
			return fallbackExtension;
		}

		return safeFileName.substring(extensionIndex);
	}

	private byte[] writeJasperReport(JasperReport jasperReport) {
		try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream(); ObjectOutputStream objectOutputStream = new ObjectOutputStream(outputStream)) {
			objectOutputStream.writeObject(jasperReport);
			objectOutputStream.flush();
			return outputStream.toByteArray();
		} catch (IOException exception) {
			throw new IllegalArgumentException("Unable to serialize the compiled Jasper report.");
		}
	}

	private JasperReport readJasperReport(byte[] jasperContent) {
		if (jasperContent == null || jasperContent.length == 0) {
			throw new IllegalArgumentException("This template does not have a compiled Jasper report.");
		}

		try (ObjectInputStream objectInputStream = new ObjectInputStream(new ByteArrayInputStream(jasperContent))) {
			return (JasperReport) objectInputStream.readObject();
		} catch (IOException | ClassNotFoundException exception) {
			throw new IllegalArgumentException("Unable to read the compiled Jasper report.");
		}
	}

	private ReportTemplatePayload toPayload(ReportTemplate template, ZoneId displayZoneId) {
		List<ParameterDefinition> parameterDefinitions = readParameterSchema(template.getParameterSchemaJson());
		DataSourceConfig dataSourceConfig = template.getDataSourceConfig();
		return new ReportTemplatePayload(
			template.getId(),
			template.getTemplateCode(),
			template.getTemplateName(),
			template.getDescription(),
			dataSourceConfig == null ? null : dataSourceConfig.getId(),
			dataSourceConfig == null ? "-" : dataSourceConfig.getConnectionLabel(),
			template.getOriginalFileName(),
			parameterDefinitions,
			formatDateTime(template.getUpdatedAt(), displayZoneId),
			formatDateTime(template.getUploadedAt(), displayZoneId),
			"-",
			"-"
		);
	}

	private ReportTemplateListItem toListItem(ReportTemplate template, ZoneId displayZoneId) {
		DataSourceConfig dataSourceConfig = template.getDataSourceConfig();
		return new ReportTemplateListItem(
			template.getId(),
			template.getTemplateCode(),
			template.getTemplateName(),
			dataSourceConfig == null ? "-" : dataSourceConfig.getConnectionLabel(),
			formatDateTime(template.getUpdatedAt(), displayZoneId),
			template.getOriginalFileName()
		);
	}

	private List<ParameterDefinition> readParameterSchema(String parameterSchemaJson) {
		if (parameterSchemaJson == null || parameterSchemaJson.isBlank()) {
			return List.of();
		}

		try {
			return objectMapper.readValue(parameterSchemaJson, new TypeReference<>() {
			});
		} catch (JsonProcessingException exception) {
			throw new IllegalArgumentException("Unable to read the stored report parameters.");
		}
	}

	private String writeParameterSchema(List<ParameterDefinition> parameters) {
		try {
			return objectMapper.writeValueAsString(parameters);
		} catch (JsonProcessingException exception) {
			throw new IllegalArgumentException("Unable to store the report parameters.");
		}
	}

	private ParameterDefinition toParameterDefinition(String name, String valueClassName) {
		String inputType = inputTypeFor(valueClassName);
		return new ParameterDefinition(name, name, valueClassName == null ? "java.lang.String" : valueClassName, inputType, false);
	}

	Map<String, Object> toParameterValues(List<ParameterDefinition> parameterDefinitions, Map<String, Object> rawParameters) {
		Map<String, Object> safeParameters = rawParameters == null ? Map.of() : rawParameters;
		Map<String, Object> values = new LinkedHashMap<>();
		for (ParameterDefinition definition : parameterDefinitions) {
			values.put(definition.name(), convertParameterValue(definition.valueClassName(), safeParameters.get(definition.name())));
		}
		return values;
	}

	Object convertParameterValue(String valueClassName, Object rawValue) {
		if (isCollectionType(valueClassName)) {
			return convertCollectionParameterValue(valueClassName, rawValue);
		}

		Object normalizedRawValue = normalizeScalarRawValue(rawValue);
		if (normalizedRawValue == null) {
			return null;
		}

		if (normalizedRawValue instanceof Integer integerValue && ("java.lang.Integer".equals(valueClassName) || "int".equals(valueClassName))) {
			return integerValue;
		}

		if (normalizedRawValue instanceof Long longValue && ("java.lang.Long".equals(valueClassName) || "long".equals(valueClassName))) {
			return longValue;
		}

		if (normalizedRawValue instanceof Double doubleValue && ("java.lang.Double".equals(valueClassName) || "double".equals(valueClassName))) {
			return doubleValue;
		}

		if (normalizedRawValue instanceof Float floatValue && ("java.lang.Float".equals(valueClassName) || "float".equals(valueClassName))) {
			return floatValue;
		}

		if (normalizedRawValue instanceof BigDecimal bigDecimalValue && "java.math.BigDecimal".equals(valueClassName)) {
			return bigDecimalValue;
		}

		if (normalizedRawValue instanceof Boolean booleanValue && ("java.lang.Boolean".equals(valueClassName) || "boolean".equals(valueClassName))) {
			return booleanValue;
		}

		String trimmedValue = normalizedRawValue instanceof String stringValue ? stringValue : normalizedRawValue.toString().trim();
		return switch (valueClassName) {
			case "java.lang.Integer", "int" -> Integer.valueOf(trimmedValue);
			case "java.lang.Long", "long" -> Long.valueOf(trimmedValue);
			case "java.lang.Double", "double" -> Double.valueOf(trimmedValue);
			case "java.lang.Float", "float" -> Float.valueOf(trimmedValue);
			case "java.math.BigDecimal" -> new BigDecimal(trimmedValue);
			case "java.lang.Boolean", "boolean" -> Boolean.valueOf(trimmedValue);
			case "java.time.LocalDate" -> LocalDate.parse(trimmedValue);
			case "java.util.Date", "java.sql.Date" -> java.sql.Date.valueOf(LocalDate.parse(trimmedValue));
			case "java.time.LocalDateTime" -> LocalDate.parse(trimmedValue).atStartOfDay();
			case "java.sql.Timestamp" -> Timestamp.valueOf(LocalDate.parse(trimmedValue).atStartOfDay());
			default -> trimmedValue;
		};
	}

	String inputTypeFor(String valueClassName) {
		if (valueClassName == null || valueClassName.isBlank()) {
			return "text";
		}

		if (isCollectionType(valueClassName)) {
			return "multivalue";
		}

		if (DATE_TYPE_NAMES.contains(valueClassName)) {
			return "date";
		}

		if (List.of("java.lang.Integer", "int", "java.lang.Long", "long", "java.lang.Double", "double", "java.lang.Float", "float", "java.math.BigDecimal").contains(valueClassName)) {
			return "number";
		}

		if (List.of("java.lang.Boolean", "boolean").contains(valueClassName)) {
			return "checkbox";
		}

		return "text";
	}

	private boolean isCollectionType(String valueClassName) {
		return valueClassName != null && COLLECTION_TYPE_NAMES.contains(valueClassName);
	}

	private Object normalizeScalarRawValue(Object rawValue) {
		if (rawValue == null) {
			return null;
		}

		if (rawValue instanceof String stringValue) {
			String trimmedValue = stringValue.trim();
			return trimmedValue.isBlank() ? null : trimmedValue;
		}

		List<Object> normalizedValues = normalizeCollectionItems(rawValue);
		if (normalizedValues.isEmpty()) {
			return null;
		}

		if (normalizedValues.size() > 1) {
			throw new IllegalArgumentException("This parameter accepts a single value only.");
		}

		return normalizedValues.get(0);
	}

	private Object convertCollectionParameterValue(String valueClassName, Object rawValue) {
		List<Object> values = normalizeCollectionParameterValues(rawValue);
		if (values.isEmpty()) {
			return null;
		}

		return switch (valueClassName) {
			case "java.util.LinkedList" -> new LinkedList<>(values);
			case "java.util.Set", "java.util.LinkedHashSet" -> new LinkedHashSet<>(values);
			case "java.util.HashSet" -> new HashSet<>(values);
			default -> new ArrayList<>(values);
		};
	}

	private List<Object> normalizeCollectionParameterValues(Object rawValue) {
		if (rawValue == null) {
			return List.of();
		}

		if (rawValue instanceof String stringValue) {
			String trimmedValue = stringValue.trim();
			if (trimmedValue.isBlank()) {
				return List.of();
			}

			if (trimmedValue.startsWith("[")) {
				try {
					return normalizeCollectionItems(objectMapper.readValue(trimmedValue, new TypeReference<List<Object>>() {
					}));
				} catch (JsonProcessingException exception) {
					throw new IllegalArgumentException("List parameters must use a valid JSON array.");
				}
			}

			return Arrays.stream(trimmedValue.split("[\\r\\n,]+"))
				.map(String::trim)
				.filter(value -> !value.isBlank())
				.map(value -> (Object) value)
				.collect(Collectors.toCollection(ArrayList::new));
		}

		return normalizeCollectionItems(rawValue);
	}

	private List<Object> normalizeCollectionItems(Object rawValue) {
		if (rawValue instanceof Collection<?> collectionValue) {
			ArrayList<Object> values = new ArrayList<>(collectionValue.size());
			for (Object item : collectionValue) {
				Object normalizedItem = normalizeCollectionItem(item);
				if (normalizedItem != null) {
					values.add(normalizedItem);
				}
			}
			return values;
		}

		if (rawValue != null && rawValue.getClass().isArray()) {
			int length = Array.getLength(rawValue);
			ArrayList<Object> values = new ArrayList<>(length);
			for (int index = 0; index < length; index++) {
				Object normalizedItem = normalizeCollectionItem(Array.get(rawValue, index));
				if (normalizedItem != null) {
					values.add(normalizedItem);
				}
			}
			return values;
		}

		Object normalizedItem = normalizeCollectionItem(rawValue);
		return normalizedItem == null ? List.of() : List.of(normalizedItem);
	}

	private Object normalizeCollectionItem(Object rawValue) {
		if (rawValue instanceof String stringValue) {
			String trimmedValue = stringValue.trim();
			return trimmedValue.isBlank() ? null : trimmedValue;
		}

		return rawValue;
	}

	private DataSourceConfig resolveOptionalDataSource(Long id) {
		if (id == null) {
			return null;
		}

		return dataSourceRepository.findById(id)
			.orElseThrow(() -> new IllegalArgumentException("The selected data source was not found."));
	}

	private String buildJdbcUrl(DataSourceConfig config) {
		return JdbcUrlFactory.build(config);
	}

	private String requireText(String value, String fieldName) {
		if (value == null || value.isBlank()) {
			throw new IllegalArgumentException(fieldName + " is required.");
		}

		return value.trim();
	}

	private String normalizeOptionalText(String value) {
		if (value == null) {
			return "";
		}

		return value.trim();
	}

	private String normalizeTemplateCode(String value) {
		String normalizedValue = normalizeOptionalText(value).toUpperCase(Locale.ROOT);
		if (normalizedValue.isBlank()) {
			return "";
		}

		if (!normalizedValue.matches("[A-Z0-9]+")) {
			throw new IllegalArgumentException("Template Code must contain uppercase letters and numbers only.");
		}

		return normalizedValue;
	}

	private void validateUniqueTemplateCode(Long templateId, String templateCode) {
		if (templateCode == null || templateCode.isBlank()) {
			return;
		}

		boolean isDuplicate = templateId == null
			? repository.existsByTemplateCodeIgnoreCase(templateCode)
			: repository.existsByTemplateCodeIgnoreCaseAndIdNot(templateCode, templateId);

		if (isDuplicate) {
			throw new IllegalArgumentException("Template Code is already in use.");
		}
	}

	private String formatDateTime(LocalDateTime value, ZoneId displayZoneId) {
		return timeDisplayService.formatStoredDateTime(value, displayZoneId);
	}

	private String sanitizeMessage(Exception exception) {
		String message = exception.getMessage();
		if (message == null || message.isBlank()) {
			return "The report engine returned an empty error message.";
		}

		message = message.replaceAll("\\s+", " ").trim();
		return message.length() > 180 ? message.substring(0, 177) + "..." : message;
	}

	private String sanitizeRuntimeMessage(RuntimeException exception) {
		String message = exception.getMessage();
		if (message == null || message.isBlank()) {
			return "The report engine returned an empty error message.";
		}

		message = message.replaceAll("\\s+", " ").trim();
		return message.length() > 180 ? message.substring(0, 177) + "..." : message;
	}

	public record ReportTemplatePayload(
		Long id,
		String templateCode,
		String templateName,
		String description,
		Long dataSourceId,
		String dataSourceName,
		String originalFileName,
		List<ParameterDefinition> parameters,
		String lastUpdated,
		String lastPublished,
		String averageRuntime,
		String monthlyRuns
	) {
	}

	public record ReportTemplateSaveRequest(
		String templateCode,
		String templateName,
		String description,
		Long dataSourceId,
		String uploadToken
	) {
	}

	public record ReportTemplateUploadResponse(
		String uploadToken,
		String originalFileName,
		List<ParameterDefinition> parameters,
		String uploadedAt
	) {
	}

	public record ReportTemplatePreviewRequest(
		Long templateId,
		Long dataSourceId,
		String uploadToken,
		Map<String, Object> parameters
	) {
	}

	public record ReportTemplateListItem(
		Long id,
		String templateCode,
		String templateName,
		String dataSourceName,
		String lastUpdated,
		String originalFileName
	) {
	}

	public record ReportTemplatePageResult(
		List<ReportTemplateListItem> items,
		long totalItems,
		int pageNumber,
		int pageSize,
		int totalPages,
		boolean hasPrevious,
		boolean hasNext
	) {
	}

	public record DownloadedTemplateFile(
		String fileName,
		byte[] content
	) {
	}

	public record ParameterDefinition(
		String name,
		String label,
		String valueClassName,
		String inputType,
		boolean required
	) {
	}

	public record ReportTemplateStats(
		long totalCount,
		String mostActiveSource,
		String lastUpload
	) {
	}

	private record UploadMetadata(
		String uploadToken,
		String originalFileName,
		String stagedJrxmlFileName,
		String stagedJasperFileName,
		List<ParameterDefinition> parameters,
		LocalDateTime uploadedAt
	) {
	}

	private record StoredTemplateFiles(
		Path jrxmlPath,
		Path jasperPath
	) {
	}

	private record PendingTemplateFiles(
		List<Path> pathsToDelete
	) {
	}

	private record CompiledTemplateArtifact(
		String originalFileName,
		byte[] jrxmlContent,
		byte[] jasperContent,
		List<ParameterDefinition> parameters
	) {
	}

	private record UploadedTemplateAsset(
		String uploadToken,
		String originalFileName,
		Path jrxmlPath,
		Path jasperPath,
		List<ParameterDefinition> parameters,
		LocalDateTime uploadedAt,
		Path metadataPath
	) {
	}

	private record PreviewContext(
		JasperReport report,
		DataSourceConfig dataSourceConfig,
		List<ParameterDefinition> parameterDefinitions,
		String auditTarget
	) {
	}

	public record ExecutedTemplate(
		Long templateId,
		String templateName,
		JasperPrint jasperPrint
	) {
	}

	public record TemplateRef(
		Long id,
		String templateName
	) {
	}

	public static class ReportTemplateNotFoundException extends RuntimeException {
		public ReportTemplateNotFoundException(long id) {
			super("Report template " + id + " was not found.");
		}
	}
}