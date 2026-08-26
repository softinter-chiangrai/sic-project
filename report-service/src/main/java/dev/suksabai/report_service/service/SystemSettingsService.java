package dev.suksabai.report_service.service;

import dev.suksabai.report_service.model.SystemSettings;
import dev.suksabai.report_service.repository.AccessTokenRepository;
import dev.suksabai.report_service.repository.DataSourceConfigRepository;
import dev.suksabai.report_service.repository.ReportDownloadLogRepository;
import dev.suksabai.report_service.repository.ReportTemplateRepository;
import dev.suksabai.report_service.repository.SystemSettingsRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.DateTimeException;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Locale;
import java.time.ZoneId;
import java.util.stream.Stream;

@Service
public class SystemSettingsService {
	private static final long SETTINGS_ID = 1L;
	private static final DateTimeFormatter DISPLAY_TIME_FORMAT = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");
	private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");
	private static final List<String> SUPPORTED_FREQUENCIES = List.of("Daily", "Weekly", "Monthly");
	private static final String DEFAULT_CLEANUP_TIMEZONE = "Asia/Bangkok";
	private static final String AUTO_CLEANUP_EVENT = "Generated Reports Auto Cleanup";
	private static final String PARTIAL_CLEANUP_EVENT = "System Cleanup Executed";
	private static final String FULL_CLEANUP_EVENT = "System Reset Executed";

	private final SystemSettingsRepository systemSettingsRepository;
	private final GeneratedReportService generatedReportService;
	private final ReportDownloadLogRepository reportDownloadLogRepository;
	private final ReportTemplateRepository reportTemplateRepository;
	private final DataSourceConfigRepository dataSourceConfigRepository;
	private final AccessTokenRepository accessTokenRepository;
	private final AuditLogService auditLogService;
	private final ConfiguredTimeDisplayService timeDisplayService;
	private final Path reportsUploadDirectory;
	private final Path reportsGeneratedDirectory;
	private final Path reportsOutputDirectory;
	private final boolean cleanupSchedulerEnabled;

	public SystemSettingsService(
		SystemSettingsRepository systemSettingsRepository,
		GeneratedReportService generatedReportService,
		ReportDownloadLogRepository reportDownloadLogRepository,
		ReportTemplateRepository reportTemplateRepository,
		DataSourceConfigRepository dataSourceConfigRepository,
		AccessTokenRepository accessTokenRepository,
		AuditLogService auditLogService,
		ConfiguredTimeDisplayService timeDisplayService,
		@Value("${file.reports-uploads-dir:data/uploads}") String reportsUploadsDirectory,
		@Value("${file.reports-generated-dir:data/generated}") String reportsGeneratedDirectory,
		@Value("${file.reports-output-dir:data/reports}") String reportsOutputDirectory,
		@Value("${app.settings.cleanup.scheduler-enabled:true}") boolean cleanupSchedulerEnabled
	) {
		this.systemSettingsRepository = systemSettingsRepository;
		this.generatedReportService = generatedReportService;
		this.reportDownloadLogRepository = reportDownloadLogRepository;
		this.reportTemplateRepository = reportTemplateRepository;
		this.dataSourceConfigRepository = dataSourceConfigRepository;
		this.accessTokenRepository = accessTokenRepository;
		this.auditLogService = auditLogService;
		this.timeDisplayService = timeDisplayService;
		this.reportsUploadDirectory = Path.of(reportsUploadsDirectory).toAbsolutePath().normalize();
		this.reportsGeneratedDirectory = Path.of(reportsGeneratedDirectory).toAbsolutePath().normalize();
		this.reportsOutputDirectory = Path.of(reportsOutputDirectory).toAbsolutePath().normalize();
		this.cleanupSchedulerEnabled = cleanupSchedulerEnabled;
	}

	@Transactional(readOnly = true)
	public SettingsPayload getSettings() {
		return getSettings(null);
	}

	@Transactional(readOnly = true)
	public SettingsPayload getSettings(HttpServletRequest request) {
		SystemSettings settings = loadSettings();
		return toPayload(settings, currentTimeForSettings(settings), detectDownloadBaseUrl(request));
	}

	@Transactional
	public SettingsPayload updateSettings(SettingsSaveRequest request) {
		return updateSettings(request, null);
	}

	@Transactional
	public SettingsPayload updateSettings(SettingsSaveRequest request, HttpServletRequest httpRequest) {
		SystemSettings settings = getOrCreateSettings();
		settings.setGeneratedReportCleanupEnabled(resolveCleanupEnabled(settings, request == null ? null : request.cleanupEnabled()));
		settings.setGeneratedReportCleanupFrequency(requireCleanupFrequency(request == null ? null : request.cleanupFrequency()));
		settings.setGeneratedReportCleanupTime(requireCleanupTime(request == null ? null : request.cleanupTime()));
		settings.setGeneratedReportCleanupTimezone(requireCleanupTimezone(request == null ? null : request.cleanupTimezone()));
		settings.setDownloadBaseUrl(normalizeDownloadBaseUrl(request == null ? null : request.downloadBaseUrl()));
		SystemSettings savedSettings = systemSettingsRepository.save(settings);
		auditLogService.logAdminAction(
			"System Settings Updated",
			describeSettingsUpdate(savedSettings),
			"Settings"
		);
		return toPayload(savedSettings, currentTimeForSettings(savedSettings), detectDownloadBaseUrl(httpRequest));
	}

	@Transactional(readOnly = true)
	public String getDownloadBaseUrl() {
		return downloadBaseUrlOf(loadSettings());
	}

	@Transactional
	public CleanupActionResponse clearGeneratedFilesAndLogs() {
		int deletedGeneratedFiles = generatedReportService.purgeGeneratedReports();
		int deletedDownloadLogs = reportDownloadLogRepository.findAll().size();
		reportDownloadLogRepository.deleteAllInBatch();
		long deletedAuditLogs = auditLogService.purgeAuditLogsPreservingCleanupHistory();

		String detail = "Cleared " + deletedAuditLogs + " audit log(s), " + deletedDownloadLogs + " download log(s), and " + deletedGeneratedFiles + " generated report file record(s).";
		auditLogService.logEvent(PARTIAL_CLEANUP_EVENT, detail, null, "Settings", "Completed");
		return new CleanupActionResponse(
			"Logs and generated report files cleared successfully.",
			deletedGeneratedFiles,
			deletedDownloadLogs,
			deletedAuditLogs,
			0,
			0,
			0
		);
	}

	@Transactional
	public CleanupActionResponse clearAllSystemData() {
		int deletedGeneratedFiles = generatedReportService.purgeGeneratedReports();
		int deletedDownloadLogs = reportDownloadLogRepository.findAll().size();
		reportDownloadLogRepository.deleteAllInBatch();

		int deletedTemplates = reportTemplateRepository.findAll().size();
		reportTemplateRepository.deleteAllInBatch();
		int deletedDataSources = dataSourceConfigRepository.findAll().size();
		dataSourceConfigRepository.deleteAllInBatch();
		int deletedAccessTokens = accessTokenRepository.findAll().size();
		accessTokenRepository.deleteAllInBatch();

		clearDirectory(reportsUploadDirectory);
		clearDirectory(reportsGeneratedDirectory);
		clearDirectory(reportsOutputDirectory);

		long deletedAuditLogs = auditLogService.purgeAuditLogsPreservingCleanupHistory();
		String detail = "Cleared the system data store: "
			+ deletedTemplates + " template(s), "
			+ deletedDataSources + " data source(s), "
			+ deletedAccessTokens + " access token(s), "
			+ deletedGeneratedFiles + " generated report file record(s), "
			+ deletedDownloadLogs + " download log(s), and "
			+ deletedAuditLogs + " audit log(s).";
		auditLogService.logEvent(FULL_CLEANUP_EVENT, detail, null, "Settings", "Completed");
		return new CleanupActionResponse(
			"All system data cleared successfully.",
			deletedGeneratedFiles,
			deletedDownloadLogs,
			deletedAuditLogs,
			deletedTemplates,
			deletedDataSources,
			deletedAccessTokens
		);
	}

	@Scheduled(cron = "0 * * * * *")
	public void runAutomaticGeneratedReportCleanup() {
		if (!cleanupSchedulerEnabled) {
			return;
		}

		SystemSettings settings = loadSettings();
		runAutomaticGeneratedReportCleanup(currentTimeForSettings(settings));
	}

	@Transactional
	public CleanupActionResponse runAutomaticGeneratedReportCleanup(LocalDateTime now) {
		SystemSettings settings = getOrCreateSettings();
		ZoneId cleanupZoneId = resolveCleanupZoneId(settings);
		LocalDateTime currentTime = (now == null ? LocalDateTime.now(cleanupZoneId) : now).withSecond(0).withNano(0);
		if (!isCleanupEnabled(settings)) {
			return new CleanupActionResponse("Automatic generated report cleanup is disabled.", 0, 0, 0, 0, 0, 0);
		}

		if (!shouldRunCleanup(settings, currentTime)) {
			return new CleanupActionResponse("Automatic generated report cleanup is not due yet.", 0, 0, 0, 0, 0, 0);
		}

		// Persisted timestamps use the same stored-timezone convention as every other entity,
		// so the cleanup-zone "now" must be converted before it is written to the database.
		LocalDateTime storedDeletedAt = timeDisplayService.toStoredDateTime(currentTime, cleanupZoneId);
		String detail = "Automatically deleted generated report files using the " + describeSchedule(settings) + " schedule.";
		int deletedGeneratedFiles = generatedReportService.markGeneratedReportsDeleted(detail, storedDeletedAt);
		settings.setLastGeneratedReportCleanupAt(storedDeletedAt);
		systemSettingsRepository.save(settings);
		if (deletedGeneratedFiles > 0) {
			auditLogService.logEvent(
				"Generated Reports Auto Cleanup",
				"Automatically deleted " + deletedGeneratedFiles + " generated report file(s) using the " + describeSchedule(settings) + " schedule.",
				null,
				"Settings",
				"Completed"
			);
		}

		return new CleanupActionResponse(
			deletedGeneratedFiles > 0 ? "Generated reports cleaned up automatically." : "Automatic cleanup completed with no generated files to delete.",
			deletedGeneratedFiles,
			0,
			0,
			0,
			0,
			0
		);
	}

	private SettingsPayload toPayload(SystemSettings settings, LocalDateTime now, String autoDetectedDownloadBaseUrl) {
		LocalDateTime effectiveNow = now == null ? currentTimeForSettings(settings) : now;
		return new SettingsPayload(
			isCleanupEnabled(settings),
			isCleanupEnabled(settings) ? "Enabled" : "Disabled",
			cleanupFrequencyOf(settings),
			formatTime(cleanupTimeOf(settings)),
			cleanupTimezoneOf(settings),
			cleanupTimezoneLabelOf(settings),
			downloadBaseUrlOf(settings),
			downloadBaseUrlDisplayOf(settings, autoDetectedDownloadBaseUrl),
			autoDetectedDownloadBaseUrl,
			describeSchedule(settings),
			formatDateTime(resolveLastAutomaticCleanupAt(settings)),
			formatDateTime(resolveNextCleanupAt(settings, effectiveNow))
		);
	}

	private SystemSettings loadSettings() {
		return systemSettingsRepository.findById(SETTINGS_ID).orElseGet(this::newDefaultSettings);
	}

	private SystemSettings getOrCreateSettings() {
		return systemSettingsRepository.findById(SETTINGS_ID)
			.orElseGet(() -> systemSettingsRepository.save(newDefaultSettings()));
	}

	private SystemSettings newDefaultSettings() {
		SystemSettings settings = new SystemSettings();
		settings.setId(SETTINGS_ID);
		settings.setGeneratedReportCleanupEnabled(true);
		settings.setGeneratedReportCleanupFrequency("Monthly");
		settings.setGeneratedReportCleanupTime(LocalTime.of(5, 0));
		settings.setGeneratedReportCleanupTimezone(DEFAULT_CLEANUP_TIMEZONE);
		return settings;
	}

	private boolean shouldRunCleanup(SystemSettings settings, LocalDateTime now) {
		if (!isCleanupEnabled(settings)) {
			return false;
		}

		LocalDateTime scheduledTime = scheduledTimeForCurrentPeriod(settings, now);
		if (scheduledTime == null || scheduledTime.isAfter(now)) {
			return false;
		}

		LocalDateTime lastCleanupAt = timeDisplayService.toDisplayDateTime(settings.getLastGeneratedReportCleanupAt(), resolveCleanupZoneId(settings));
		return lastCleanupAt == null || lastCleanupAt.isBefore(scheduledTime);
	}

	private LocalDateTime scheduledTimeForCurrentPeriod(SystemSettings settings, LocalDateTime now) {
		LocalTime cleanupTime = cleanupTimeOf(settings);
		return switch (cleanupFrequencyOf(settings)) {
			case "Monthly" -> LocalDate.of(now.getYear(), now.getMonth(), 1).atTime(cleanupTime);
			case "Weekly" -> now.toLocalDate().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atTime(cleanupTime);
			default -> now.toLocalDate().atTime(cleanupTime);
		};
	}

	private LocalDateTime resolveNextCleanupAt(SystemSettings settings, LocalDateTime now) {
		if (!isCleanupEnabled(settings)) {
			return null;
		}

		LocalDateTime currentPeriodRun = scheduledTimeForCurrentPeriod(settings, now);
		if (currentPeriodRun.isAfter(now)) {
			return currentPeriodRun;
		}

		return switch (cleanupFrequencyOf(settings)) {
			case "Monthly" -> now.toLocalDate().withDayOfMonth(1).plusMonths(1).atTime(cleanupTimeOf(settings));
			case "Weekly" -> now.toLocalDate().with(TemporalAdjusters.next(DayOfWeek.MONDAY)).atTime(cleanupTimeOf(settings));
			default -> now.toLocalDate().plusDays(1).atTime(cleanupTimeOf(settings));
		};
	}

	private LocalDateTime resolveLastAutomaticCleanupAt(SystemSettings settings) {
		ZoneId cleanupZoneId = resolveCleanupZoneId(settings);
		LocalDateTime persistedValue = settings.getLastGeneratedReportCleanupAt();
		if (persistedValue != null) {
			return timeDisplayService.toDisplayDateTime(persistedValue, cleanupZoneId);
		}

		return timeDisplayService.toDisplayDateTime(auditLogService.findLatestEventOccurredAt(AUTO_CLEANUP_EVENT), cleanupZoneId);
	}

	private String describeSchedule(SystemSettings settings) {
		String time = formatTime(cleanupTimeOf(settings));
		return switch (cleanupFrequencyOf(settings)) {
			case "Monthly" -> "monthly on day 1 at " + time;
			case "Weekly" -> "weekly on Monday at " + time;
			default -> "daily at " + time;
		};
	}

	private String describeSettings(SystemSettings settings) {
		return (isCleanupEnabled(settings) ? "enabled " : "disabled ") + describeSchedule(settings);
	}

	private String describeSettingsUpdate(SystemSettings settings) {
		String downloadBaseUrl = downloadBaseUrlOf(settings);
		if (downloadBaseUrl.isBlank()) {
			return "Updated generated report cleanup schedule to " + describeSettings(settings) + " and cleared the download base URL.";
		}

		return "Updated generated report cleanup schedule to " + describeSettings(settings) + " and set the download base URL to " + downloadBaseUrl + ".";
	}

	private boolean isCleanupEnabled(SystemSettings settings) {
		return settings.getGeneratedReportCleanupEnabled() == null || settings.getGeneratedReportCleanupEnabled();
	}

	private String cleanupFrequencyOf(SystemSettings settings) {
		String frequency = settings.getGeneratedReportCleanupFrequency();
		return frequency == null || frequency.isBlank() ? "Monthly" : frequency;
	}

	private LocalTime cleanupTimeOf(SystemSettings settings) {
		return settings.getGeneratedReportCleanupTime() == null ? LocalTime.of(5, 0) : settings.getGeneratedReportCleanupTime();
	}

	private String cleanupTimezoneOf(SystemSettings settings) {
		return resolveCleanupZoneId(settings).getId();
	}

	private String cleanupTimezoneLabelOf(SystemSettings settings) {
		return formatCleanupTimezoneLabel(resolveCleanupZoneId(settings).getId());
	}

	private String downloadBaseUrlOf(SystemSettings settings) {
		String downloadBaseUrl = settings == null ? null : settings.getDownloadBaseUrl();
		return downloadBaseUrl == null ? "" : downloadBaseUrl.trim();
	}

	private String downloadBaseUrlDisplayOf(SystemSettings settings, String autoDetectedDownloadBaseUrl) {
		String downloadBaseUrl = downloadBaseUrlOf(settings);
		if (!downloadBaseUrl.isBlank()) {
			return downloadBaseUrl;
		}

		return autoDetectedDownloadBaseUrl == null || autoDetectedDownloadBaseUrl.isBlank()
			? "Auto-detect from current request"
			: autoDetectedDownloadBaseUrl;
	}

	private String detectDownloadBaseUrl(HttpServletRequest request) {
		if (request == null) {
			return "";
		}

		String detected = ServletUriComponentsBuilder.fromContextPath(request)
			.build()
			.toUriString();
		while (detected.endsWith("/")) {
			detected = detected.substring(0, detected.length() - 1);
		}
		return detected;
	}

	private String formatCleanupTimezoneLabel(String timezoneId) {
		if (timezoneId == null || timezoneId.isBlank()) {
			return "Bangkok (UTC+07:00)";
		}

		return switch (timezoneId) {
			case "UTC" -> "UTC (UTC+00:00)";
			case "Asia/Dubai" -> "Dubai (UTC+04:00)";
			case "Asia/Kolkata" -> "Kolkata (UTC+05:30)";
			case "Asia/Bangkok" -> "Bangkok (UTC+07:00)";
			case "Asia/Ho_Chi_Minh" -> "Ho Chi Minh City (UTC+07:00)";
			case "Asia/Jakarta" -> "Jakarta (UTC+07:00)";
			case "Asia/Hong_Kong" -> "Hong Kong (UTC+08:00)";
			case "Asia/Kuala_Lumpur" -> "Kuala Lumpur (UTC+08:00)";
			case "Asia/Manila" -> "Manila (UTC+08:00)";
			case "Asia/Shanghai" -> "Shanghai (UTC+08:00)";
			case "Asia/Singapore" -> "Singapore (UTC+08:00)";
			case "Asia/Taipei" -> "Taipei (UTC+08:00)";
			case "Asia/Seoul" -> "Seoul (UTC+09:00)";
			case "Asia/Tokyo" -> "Tokyo (UTC+09:00)";
			case "Europe/London" -> "London (UTC+01:00)";
			case "Europe/Paris" -> "Paris (UTC+02:00)";
			case "Europe/Berlin" -> "Berlin (UTC+02:00)";
			case "Europe/Madrid" -> "Madrid (UTC+02:00)";
			case "Europe/Istanbul" -> "Istanbul (UTC+03:00)";
			case "America/Sao_Paulo" -> "Sao Paulo (UTC-03:00)";
			case "America/New_York" -> "New York (UTC-04:00)";
			case "America/Chicago" -> "Chicago (UTC-05:00)";
			case "America/Denver" -> "Denver (UTC-06:00)";
			case "America/Los_Angeles" -> "Los Angeles (UTC-07:00)";
			case "Africa/Johannesburg" -> "Johannesburg (UTC+02:00)";
			case "Australia/Perth" -> "Perth (UTC+08:00)";
			case "Australia/Sydney" -> "Sydney (UTC+10:00)";
			case "Pacific/Auckland" -> "Auckland (UTC+12:00)";
			default -> timezoneId;
		};
	}

	private ZoneId resolveCleanupZoneId(SystemSettings settings) {
		String timezone = settings == null ? null : settings.getGeneratedReportCleanupTimezone();
		if (timezone == null || timezone.isBlank()) {
			return ZoneId.of(DEFAULT_CLEANUP_TIMEZONE);
		}

		try {
			return ZoneId.of(timezone.trim());
		} catch (DateTimeException exception) {
			return ZoneId.of(DEFAULT_CLEANUP_TIMEZONE);
		}
	}

	private LocalDateTime currentTimeForSettings(SystemSettings settings) {
		return LocalDateTime.now(resolveCleanupZoneId(settings));
	}

	private boolean resolveCleanupEnabled(SystemSettings settings, Boolean cleanupEnabled) {
		return cleanupEnabled != null ? cleanupEnabled : isCleanupEnabled(settings);
	}

	private String requireCleanupFrequency(String frequency) {
		if (frequency == null || frequency.isBlank()) {
			throw new IllegalArgumentException("Cleanup frequency is required.");
		}

		String normalized = frequency.trim().substring(0, 1).toUpperCase(Locale.ROOT) + frequency.trim().substring(1).toLowerCase(Locale.ROOT);
		if (!SUPPORTED_FREQUENCIES.contains(normalized)) {
			throw new IllegalArgumentException("Cleanup frequency is invalid.");
		}

		return normalized;
	}

	private LocalTime requireCleanupTime(String cleanupTime) {
		if (cleanupTime == null || cleanupTime.isBlank()) {
			throw new IllegalArgumentException("Cleanup time is required.");
		}

		try {
			return LocalTime.parse(cleanupTime.trim());
		} catch (RuntimeException exception) {
			throw new IllegalArgumentException("Cleanup time is invalid.");
		}
	}

	private String requireCleanupTimezone(String cleanupTimezone) {
		if (cleanupTimezone == null || cleanupTimezone.isBlank()) {
			throw new IllegalArgumentException("Cleanup timezone is required.");
		}

		try {
			return ZoneId.of(cleanupTimezone.trim()).getId();
		} catch (DateTimeException exception) {
			throw new IllegalArgumentException("Cleanup timezone is invalid.");
		}
	}

	private String normalizeDownloadBaseUrl(String downloadBaseUrl) {
		if (downloadBaseUrl == null || downloadBaseUrl.isBlank()) {
			return null;
		}

		String normalized = downloadBaseUrl.trim();
		while (normalized.endsWith("/")) {
			normalized = normalized.substring(0, normalized.length() - 1);
		}

		try {
			URI uri = new URI(normalized);
			String scheme = uri.getScheme();
			if (scheme == null || (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme))) {
				throw new IllegalArgumentException("Download base URL must start with http:// or https://.");
			}
			if (uri.getHost() == null || uri.getHost().isBlank()) {
				throw new IllegalArgumentException("Download base URL must include a valid host.");
			}
			if (uri.getQuery() != null || uri.getFragment() != null) {
				throw new IllegalArgumentException("Download base URL cannot include a query string or fragment.");
			}
			return uri.toString();
		} catch (URISyntaxException exception) {
			throw new IllegalArgumentException("Download base URL is invalid.");
		}
	}

	private String formatTime(LocalTime time) {
		return time == null ? "-" : time.format(TIME_FORMAT);
	}

	private String formatDateTime(LocalDateTime value) {
		return value == null ? "-" : value.format(DISPLAY_TIME_FORMAT);
	}

	private void clearDirectory(Path directory) {
		try {
			if (Files.exists(directory)) {
				try (Stream<Path> paths = Files.walk(directory)) {
					paths.sorted((left, right) -> right.getNameCount() - left.getNameCount())
						.filter(path -> !path.equals(directory))
						.forEach(this::deletePathQuietly);
				}
			}
			Files.createDirectories(directory);
		} catch (IOException exception) {
			throw new IllegalArgumentException("Unable to clear the report storage directories.");
		}
	}

	private void deletePathQuietly(Path path) {
		try {
			Files.deleteIfExists(path);
		} catch (IOException ignored) {
			// Continue cleanup for remaining files.
		}
	}

	public record SettingsPayload(
		boolean cleanupEnabled,
		String cleanupStatus,
		String cleanupFrequency,
		String cleanupTime,
		String cleanupTimezone,
		String cleanupTimezoneLabel,
		String downloadBaseUrl,
		String downloadBaseUrlDisplay,
		String autoDetectedDownloadBaseUrl,
		String cleanupDescription,
		String lastCleanupAt,
		String nextCleanupAt
	) {
	}

	public record SettingsSaveRequest(
		Boolean cleanupEnabled,
		String cleanupFrequency,
		String cleanupTime,
		String cleanupTimezone,
		String downloadBaseUrl
	) {
	}

	public record CleanupActionResponse(
		String message,
		int deletedGeneratedFiles,
		int deletedDownloadLogs,
		long deletedAuditLogs,
		int deletedTemplates,
		int deletedDataSources,
		int deletedAccessTokens
	) {
	}
}