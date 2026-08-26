package dev.suksabai.report_service.controller;

import dev.suksabai.report_service.service.SystemSettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@Tag(name = "Admin / Settings API", description = "Administrative APIs for cleanup scheduling and system data reset actions.")
@SecurityRequirement(name = "sessionCookieAuth")
public class SettingsApiController {
	private final SystemSettingsService systemSettingsService;

	public SettingsApiController(SystemSettingsService systemSettingsService) {
		this.systemSettingsService = systemSettingsService;
	}

	@GetMapping
	@Operation(summary = "Get system settings", description = "Load the cleanup schedule settings for the admin settings page.")
	public SystemSettingsService.SettingsPayload getSettings(HttpServletRequest request) {
		return systemSettingsService.getSettings(request);
	}

	@PutMapping
	@Operation(summary = "Update system settings", description = "Update the automatic generated-report cleanup schedule.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "Settings updated successfully"),
		@ApiResponse(responseCode = "400", description = "Invalid settings payload")
	})
	public SystemSettingsService.SettingsPayload updateSettings(@RequestBody SystemSettingsService.SettingsSaveRequest request, HttpServletRequest httpRequest) {
		return systemSettingsService.updateSettings(request, httpRequest);
	}

	@PostMapping("/cleanup/generated-files-and-logs")
	@Operation(summary = "Clear logs and generated files", description = "Delete generated report metadata/files and log data while preserving cleanup audit history.")
	public SystemSettingsService.CleanupActionResponse clearGeneratedFilesAndLogs() {
		return systemSettingsService.clearGeneratedFilesAndLogs();
	}

	@PostMapping("/cleanup/all")
	@Operation(summary = "Clear all system data", description = "Delete templates, data sources, access tokens, generated files, and logs while preserving cleanup audit history.")
	public SystemSettingsService.CleanupActionResponse clearAllSystemData() {
		return systemSettingsService.clearAllSystemData();
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException exception) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
			.body(Map.of("message", exception.getMessage()));
	}
}