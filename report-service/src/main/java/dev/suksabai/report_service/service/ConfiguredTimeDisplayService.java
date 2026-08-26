package dev.suksabai.report_service.service;

import dev.suksabai.report_service.model.SystemSettings;
import dev.suksabai.report_service.repository.SystemSettingsRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
public class ConfiguredTimeDisplayService {
	private static final long SETTINGS_ID = 1L;
	private static final String DEFAULT_DISPLAY_TIMEZONE = "Asia/Bangkok";
	private static final DateTimeFormatter DISPLAY_TIME_FORMAT = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");
	private static final DateTimeFormatter EXPORT_TIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

	private final SystemSettingsRepository systemSettingsRepository;
	private final ZoneId storedTimestampZoneId;

	public ConfiguredTimeDisplayService(
		SystemSettingsRepository systemSettingsRepository,
		@Value("${app.display.stored-timestamp-timezone:UTC}") String storedTimestampTimezone
	) {
		this.systemSettingsRepository = systemSettingsRepository;
		this.storedTimestampZoneId = resolveZoneId(storedTimestampTimezone, ZoneId.of("UTC"));
	}

	public ZoneId currentDisplayZoneId() {
		return systemSettingsRepository.findById(SETTINGS_ID)
			.map(SystemSettings::getGeneratedReportCleanupTimezone)
			.map(timezone -> resolveZoneId(timezone, ZoneId.of(DEFAULT_DISPLAY_TIMEZONE)))
			.orElseGet(() -> ZoneId.of(DEFAULT_DISPLAY_TIMEZONE));
	}

	public LocalDate currentDisplayDate() {
		return LocalDate.now(currentDisplayZoneId());
	}

	public LocalDateTime toDisplayDateTime(LocalDateTime value, ZoneId displayZoneId) {
		if (value == null) {
			return null;
		}

		return value.atZone(storedTimestampZoneId)
			.withZoneSameInstant(displayZoneId)
			.toLocalDateTime();
	}

	public LocalDateTime toStoredDateTime(LocalDateTime displayValue, ZoneId displayZoneId) {
		if (displayValue == null) {
			return null;
		}

		return displayValue.atZone(displayZoneId)
			.withZoneSameInstant(storedTimestampZoneId)
			.toLocalDateTime();
	}

	public String formatStoredDateTime(LocalDateTime value, ZoneId displayZoneId) {
		return formatStoredDateTime(value, displayZoneId, "-");
	}

	public String formatStoredDateTime(LocalDateTime value, ZoneId displayZoneId, String nullValue) {
		LocalDateTime displayValue = toDisplayDateTime(value, displayZoneId);
		return displayValue == null ? nullValue : displayValue.format(DISPLAY_TIME_FORMAT);
	}

	public String formatStoredExportDateTime(LocalDateTime value, ZoneId displayZoneId) {
		LocalDateTime displayValue = toDisplayDateTime(value, displayZoneId);
		return displayValue == null ? "-" : displayValue.format(EXPORT_TIME_FORMAT);
	}

	private ZoneId resolveZoneId(String timezone, ZoneId fallbackZoneId) {
		if (timezone == null || timezone.isBlank()) {
			return fallbackZoneId;
		}

		try {
			return ZoneId.of(timezone.trim());
		} catch (DateTimeException exception) {
			return fallbackZoneId;
		}
	}
}