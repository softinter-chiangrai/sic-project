package dev.suksabai.report_service.service;

import dev.suksabai.report_service.model.DataSourceConfig;
import dev.suksabai.report_service.model.DataSourceType;
import dev.suksabai.report_service.repository.DataSourceConfigRepository;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.DriverManager;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Locale;

@Service
public class DataSourceConfigService {

	private final DataSourceConfigRepository repository;
	private final AuditLogService auditLogService;
	private final ConfiguredTimeDisplayService timeDisplayService;

	public DataSourceConfigService(DataSourceConfigRepository repository, AuditLogService auditLogService, ConfiguredTimeDisplayService timeDisplayService) {
		this.repository = repository;
		this.auditLogService = auditLogService;
		this.timeDisplayService = timeDisplayService;
	}

	@Transactional(readOnly = true)
	public List<DataSourceListItem> getAllSummaries() {
		ZoneId displayZoneId = timeDisplayService.currentDisplayZoneId();
		return repository.findAllByOrderByUpdatedAtDesc().stream()
			.map(config -> toListItem(config, displayZoneId))
			.toList();
	}

	@Transactional(readOnly = true)
	public DataSourcePageResult getPage(String query, String type, String status, int page, int size) {
		int safePage = Math.max(page, 0);
		int safeSize = Math.max(1, Math.min(size, 50));
		ZoneId displayZoneId = timeDisplayService.currentDisplayZoneId();
		String normalizedQuery = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);
		String normalizedType = type == null ? "" : type.trim().toLowerCase(Locale.ROOT);
		String normalizedStatus = status == null ? "" : status.trim().toLowerCase(Locale.ROOT);

		List<DataSourceListItem> filteredItems = repository.findAllByOrderByUpdatedAtDesc().stream()
			.filter(config -> matchesQuery(config, normalizedQuery))
			.filter(config -> matchesType(config, normalizedType))
			.filter(config -> matchesStatus(config, normalizedStatus))
			.map(config -> toListItem(config, displayZoneId))
			.toList();

		long totalItems = filteredItems.size();
		int totalPages = totalItems == 0 ? 0 : (int) Math.ceil((double) totalItems / safeSize);
		int resolvedPage = totalPages == 0 ? 0 : Math.min(safePage, totalPages - 1);
		int startIndex = Math.min(resolvedPage * safeSize, filteredItems.size());
		int endIndex = Math.min(startIndex + safeSize, filteredItems.size());

		PageImpl<DataSourceListItem> itemPage = new PageImpl<>(
			filteredItems.subList(startIndex, endIndex),
			PageRequest.of(resolvedPage, safeSize),
			totalItems
		);

		return new DataSourcePageResult(
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
	public DataSourceStats getStats() {
		List<DataSourceConfig> configs = repository.findAll();
		long activeCount = configs.stream().filter(config -> "Connected".equalsIgnoreCase(config.getLastTestStatus())).count();
		long failedCount = configs.stream().filter(config -> "Failed".equalsIgnoreCase(config.getLastTestStatus())).count();
		long timedCount = configs.stream().filter(config -> config.getLastResponseTimeMs() != null).count();
		long averageResponse = timedCount == 0 ? 0 : Math.round(configs.stream()
			.filter(config -> config.getLastResponseTimeMs() != null)
			.mapToLong(DataSourceConfig::getLastResponseTimeMs)
			.average()
			.orElse(0));

		return new DataSourceStats(configs.size(), activeCount, failedCount, averageResponse == 0 ? "-" : averageResponse + " ms");
	}

	@Transactional(readOnly = true)
	public DataSourcePayload getConfig(long id) {
		ZoneId displayZoneId = timeDisplayService.currentDisplayZoneId();
		return repository.findById(id)
			.map(config -> toPayload(config, displayZoneId))
			.orElseThrow(() -> new DataSourceNotFoundException(id));
	}

	@Transactional(readOnly = true)
	public boolean exists(long id) {
		return repository.existsById(id);
	}

	@Transactional
	public void delete(long id) {
		DataSourceConfig config = repository.findById(id)
			.orElseThrow(() -> new DataSourceNotFoundException(id));
		String connectionLabel = config.getConnectionLabel();
		repository.delete(config);
		auditLogService.logAdminAction(
			"Data Source Deleted",
			"Deleted data source " + connectionLabel,
			connectionLabel
		);
	}

	@Transactional
	public DataSourcePayload create(DataSourceSaveRequest request) {
		DataSourceConfig config = new DataSourceConfig();
		applyRequest(config, request, true);
		config.setLastTestStatus("Not tested");
		config.setLastTestedAt(null);
		config.setLastResponseTimeMs(null);
		DataSourceConfig savedConfig = repository.save(config);
		auditLogService.logAdminAction(
			"Data Source Created",
			"Created data source " + savedConfig.getConnectionLabel(),
			savedConfig.getConnectionLabel()
		);
		return toPayload(savedConfig, timeDisplayService.currentDisplayZoneId());
	}

	@Transactional
	public DataSourcePayload update(long id, DataSourceSaveRequest request) {
		DataSourceConfig config = repository.findById(id)
			.orElseThrow(() -> new DataSourceNotFoundException(id));
		applyRequest(config, request, false);
		DataSourceConfig savedConfig = repository.save(config);
		auditLogService.logAdminAction(
			"Data Source Updated",
			"Updated data source " + savedConfig.getConnectionLabel(),
			savedConfig.getConnectionLabel()
		);
		return toPayload(savedConfig, timeDisplayService.currentDisplayZoneId());
	}

	@Transactional
	public ConnectionTestResponse testSavedConnection(long id) {
		DataSourceConfig config = repository.findById(id)
			.orElseThrow(() -> new DataSourceNotFoundException(id));
		long startTime = System.nanoTime();

		try {
			ZoneId displayZoneId = timeDisplayService.currentDisplayZoneId();
			DriverManager.setLoginTimeout(resolveConnectTimeoutSeconds(config));
			try (var connection = DriverManager.getConnection(buildJdbcUrl(config), config.getUsername(), config.getPassword())) {
				connection.isValid(5);
			}

			long elapsedMillis = Math.max(1L, (System.nanoTime() - startTime) / 1_000_000L);
			config.setLastTestStatus("Connected");
			config.setLastTestedAt(LocalDateTime.now());
			config.setLastResponseTimeMs(elapsedMillis);
			repository.save(config);
			auditLogService.logDataSourceTest(config.getConnectionLabel(), true, "Response time " + elapsedMillis + " ms");
			return new ConnectionTestResponse(
				true,
				false,
				"Connection test completed successfully using the saved configuration.",
				config.getLastTestStatus(),
				formatDateTime(config.getLastTestedAt(), displayZoneId),
				elapsedMillis + " ms"
			);
		} catch (SQLException exception) {
			ZoneId displayZoneId = timeDisplayService.currentDisplayZoneId();
			config.setLastTestStatus("Failed");
			config.setLastTestedAt(LocalDateTime.now());
			config.setLastResponseTimeMs(null);
			repository.save(config);
			auditLogService.logDataSourceTest(config.getConnectionLabel(), false, sanitizeMessage(exception));
			return new ConnectionTestResponse(
				false,
				false,
				sanitizeMessage(exception),
				config.getLastTestStatus(),
				formatDateTime(config.getLastTestedAt(), displayZoneId),
				"-"
			);
		}
	}

	private void applyRequest(DataSourceConfig config, DataSourceSaveRequest request, boolean requirePassword) {
		config.setDatabaseName(requireText(request.databaseName(), "Database Name"));
		config.setConnectionLabel(requireText(request.connectionLabel(), "Connection Label"));
		config.setDatabaseType(requireType(request.databaseType()));
		config.setHostAddress(requireText(request.hostAddress(), "Host Address"));
		config.setPort(requirePort(request.port()));
		config.setUsername(requireText(request.username(), "Username"));
		config.setConnectTimeoutSeconds(requireTimeoutSeconds(request.connectTimeoutSeconds(), DataSourceConfig.DEFAULT_CONNECT_TIMEOUT_SECONDS, "Connect Timeout"));
		config.setSocketTimeoutSeconds(requireTimeoutSeconds(request.socketTimeoutSeconds(), DataSourceConfig.DEFAULT_SOCKET_TIMEOUT_SECONDS, "Socket Timeout"));

		if (requirePassword) {
			config.setPassword(requireText(request.password(), "Password"));
			return;
		}

		if (request.password() != null && !request.password().isBlank()) {
			config.setPassword(request.password().trim());
		}
	}

	private DataSourcePayload toPayload(DataSourceConfig config, ZoneId displayZoneId) {
		return new DataSourcePayload(
			config.getId(),
			config.getDatabaseName(),
			config.getConnectionLabel(),
			config.getDatabaseType(),
			config.getHostAddress(),
			config.getPort(),
			config.getUsername(),
			resolveConnectTimeoutSeconds(config),
			resolveSocketTimeoutSeconds(config),
			config.getPassword() != null && !config.getPassword().isBlank(),
			config.getLastTestStatus(),
			formatDateTime(config.getLastTestedAt(), displayZoneId),
			config.getLastResponseTimeMs() == null ? "-" : config.getLastResponseTimeMs() + " ms"
		);
	}

	private boolean matchesQuery(DataSourceConfig config, String query) {
		if (query.isBlank()) {
			return true;
		}

		return containsIgnoreCase(config.getConnectionLabel(), query)
			|| containsIgnoreCase(config.getDatabaseName(), query)
			|| containsIgnoreCase(config.getHostAddress(), query)
			|| containsIgnoreCase(config.getUsername(), query)
			|| containsIgnoreCase(config.getDatabaseType().getValue(), query);
	}

	private boolean matchesType(DataSourceConfig config, String type) {
		if (type.isBlank()) {
			return true;
		}

		return config.getDatabaseType().getValue().equalsIgnoreCase(type);
	}

	private boolean matchesStatus(DataSourceConfig config, String status) {
		if (status.isBlank()) {
			return true;
		}

		return statusSlug(config.getLastTestStatus()).equals(status);
	}

	private boolean containsIgnoreCase(String value, String expected) {
		return value != null && value.toLowerCase(Locale.ROOT).contains(expected);
	}

	private String statusSlug(String status) {
		if (status == null || status.isBlank()) {
			return "not-tested";
		}

		return status.trim().toLowerCase(Locale.ROOT).replace(' ', '-');
	}

	private DataSourceListItem toListItem(DataSourceConfig config, ZoneId displayZoneId) {
		return new DataSourceListItem(
			config.getId(),
			config.getConnectionLabel(),
			config.getDatabaseName(),
			config.getDatabaseType().getValue(),
			config.getHostAddress(),
			config.getLastTestStatus(),
			statusClassFor(config.getLastTestStatus()),
			formatListDateTime(config.getLastTestedAt(), displayZoneId),
			pillClassFor(config.getDatabaseType()),
			iconFor(config.getDatabaseType())
		);
	}

	private String buildJdbcUrl(DataSourceConfig config) {
		return JdbcUrlFactory.build(config);
	}

	private int resolveConnectTimeoutSeconds(DataSourceConfig config) {
		return normalizeTimeoutSeconds(config.getConnectTimeoutSeconds(), DataSourceConfig.DEFAULT_CONNECT_TIMEOUT_SECONDS);
	}

	private int resolveSocketTimeoutSeconds(DataSourceConfig config) {
		return normalizeTimeoutSeconds(config.getSocketTimeoutSeconds(), DataSourceConfig.DEFAULT_SOCKET_TIMEOUT_SECONDS);
	}

	private String sanitizeMessage(SQLException exception) {
		String message = exception.getMessage();
		if (message == null || message.isBlank()) {
			return "Connection test failed using the saved configuration.";
		}

		message = message.replaceAll("\\s+", " ").trim();
		if (message.length() > 180) {
			message = message.substring(0, 177) + "...";
		}

		return "Connection test failed. " + message;
	}

	private String requireText(String value, String fieldName) {
		if (value == null || value.isBlank()) {
			throw new IllegalArgumentException(fieldName + " is required.");
		}

		return value.trim();
	}

	private DataSourceType requireType(DataSourceType databaseType) {
		if (databaseType == null) {
			throw new IllegalArgumentException("Database Type is required.");
		}

		return databaseType;
	}

	private Integer requirePort(Integer port) {
		if (port == null || port <= 0) {
			throw new IllegalArgumentException("Port must be greater than zero.");
		}

		return port;
	}

	private Integer requireTimeoutSeconds(Integer timeoutSeconds, int defaultValue, String fieldName) {
		int resolvedValue = normalizeTimeoutSeconds(timeoutSeconds, defaultValue);
		if (resolvedValue <= 0) {
			throw new IllegalArgumentException(fieldName + " must be greater than zero.");
		}

		return resolvedValue;
	}

	private int normalizeTimeoutSeconds(Integer timeoutSeconds, int defaultValue) {
		if (timeoutSeconds == null) {
			return defaultValue;
		}

		if (timeoutSeconds <= 0) {
			throw new IllegalArgumentException("Timeout values must be greater than zero.");
		}

		return timeoutSeconds;
	}

	private String formatDateTime(LocalDateTime value, ZoneId displayZoneId) {
		return timeDisplayService.formatStoredDateTime(value, displayZoneId);
	}

	private String formatListDateTime(LocalDateTime value, ZoneId displayZoneId) {
		return timeDisplayService.formatStoredDateTime(value, displayZoneId, "Never");
	}

	private String statusClassFor(String status) {
		if ("Connected".equalsIgnoreCase(status)) {
			return "status-dot status-dot--success";
		}

		if ("Failed".equalsIgnoreCase(status)) {
			return "status-dot status-dot--error";
		}

		return "status-dot";
	}

	private String pillClassFor(DataSourceType type) {
		return switch (type) {
			case POSTGRESQL -> "pill pill--info";
			case MYSQL -> "pill pill--warning";
			case MARIADB -> "pill pill--success";
			case ORACLE -> "pill pill--danger";
		};
	}

	private String iconFor(DataSourceType type) {
		return switch (type) {
			case POSTGRESQL -> "storage";
			case MYSQL -> "dns";
			case MARIADB -> "dataset";
			case ORACLE -> "table_view";
		};
	}

	public record DataSourcePayload(
		Long id,
		String databaseName,
		String connectionLabel,
		DataSourceType databaseType,
		String hostAddress,
		Integer port,
		String username,
		Integer connectTimeoutSeconds,
		Integer socketTimeoutSeconds,
		boolean passwordConfigured,
		String status,
		String lastTested,
		String responseTime
	) {
	}

	public record DataSourceSaveRequest(
		String databaseName,
		String connectionLabel,
		DataSourceType databaseType,
		String hostAddress,
		Integer port,
		String username,
		Integer connectTimeoutSeconds,
		Integer socketTimeoutSeconds,
		String password
	) {
	}

	public record ConnectionTestResponse(
		boolean success,
		boolean saveRequired,
		String message,
		String status,
		String lastTested,
		String responseTime
	) {
	}

	public record DataSourceListItem(
		Long id,
		String connectionLabel,
		String databaseName,
		String databaseType,
		String hostAddress,
		String status,
		String statusClass,
		String lastTested,
		String typePillClass,
		String icon
	) {
	}

	public record DataSourcePageResult(
		List<DataSourceListItem> items,
		long totalItems,
		int pageNumber,
		int pageSize,
		int totalPages,
		boolean hasPrevious,
		boolean hasNext
	) {
	}

	public record DataSourceStats(long totalCount, long activeCount, long failedCount, String averageResponse) {
	}

	public static class DataSourceNotFoundException extends RuntimeException {
		public DataSourceNotFoundException(long id) {
			super("Data source " + id + " was not found.");
		}
	}
}