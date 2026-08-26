package dev.suksabai.report_service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import dev.suksabai.report_service.model.AccessToken;
import dev.suksabai.report_service.model.AuditLogEvent;
import dev.suksabai.report_service.model.DataSourceConfig;
import dev.suksabai.report_service.model.DataSourceType;
import dev.suksabai.report_service.model.GeneratedReportFile;
import dev.suksabai.report_service.model.ReportTemplate;
import dev.suksabai.report_service.repository.AccessTokenRepository;
import dev.suksabai.report_service.repository.AuditLogEventRepository;
import dev.suksabai.report_service.repository.DataSourceConfigRepository;
import dev.suksabai.report_service.repository.GeneratedReportFileRepository;
import dev.suksabai.report_service.repository.ReportDownloadLogRepository;
import dev.suksabai.report_service.repository.ReportTemplateRepository;
import dev.suksabai.report_service.repository.SystemSettingsRepository;
import dev.suksabai.report_service.service.AuditLogService;
import dev.suksabai.report_service.service.ReportTemplateService;
import dev.suksabai.report_service.service.SystemSettingsService;
import org.springframework.mock.web.MockMultipartFile;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class ReportServiceApplicationTests {

	private static final java.nio.file.Path TEST_UPLOADS_DIR = java.nio.file.Path.of("target/test-uploads");
	private static final java.nio.file.Path TEST_GENERATED_DIR = java.nio.file.Path.of("target/test-generated");
	private static final java.nio.file.Path TEST_REPORTS_DIR = java.nio.file.Path.of("target/test-reports");

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private AccessTokenRepository accessTokenRepository;

	@Autowired
	private GeneratedReportFileRepository generatedReportFileRepository;

	@Autowired
	private ReportDownloadLogRepository reportDownloadLogRepository;

	@Autowired
	private AuditLogEventRepository auditLogEventRepository;

	@Autowired
	private DataSourceConfigRepository dataSourceConfigRepository;

	@Autowired
	private ReportTemplateRepository reportTemplateRepository;

	@Autowired
	private ReportTemplateService reportTemplateService;

	@Autowired
	private SystemSettingsService systemSettingsService;

	@Autowired
	private SystemSettingsRepository systemSettingsRepository;

	@Autowired
	private AuditLogService auditLogService;

	@BeforeEach
	void cleanDatabase() {
		systemSettingsRepository.deleteAll();
		auditLogEventRepository.deleteAll();
		reportDownloadLogRepository.deleteAll();
		generatedReportFileRepository.deleteAll();
		accessTokenRepository.deleteAll();
		reportTemplateRepository.deleteAll();
		dataSourceConfigRepository.deleteAll();
		deleteDirectory(TEST_UPLOADS_DIR);
		deleteDirectory(TEST_GENERATED_DIR);
		deleteDirectory(TEST_REPORTS_DIR);
	}

	@Test
	void contextLoads() {
	}

	@Test
	void loginPageShouldRender() throws Exception {
		mockMvc.perform(get("/login"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Welcome back")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("material-symbols-outlined")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("analytics")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Your login session will stay active for 12 hours.")))
			.andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("fonts.googleapis.com"))));
	}

	@Test
	void loginShouldSetThirtyDayRememberMeCookieWhenCheckboxIsChecked() throws Exception {
		mockMvc.perform(post("/login")
				.with(csrf())
				.param("username", "admin")
				.param("password", "admin")
				.param("remember-me", "on"))
			.andExpect(status().is3xxRedirection())
			.andExpect(redirectedUrl("/"))
			.andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Set-Cookie", org.hamcrest.Matchers.allOf(
				org.hamcrest.Matchers.containsString("remember-me="),
				org.hamcrest.Matchers.containsString("Max-Age=2592000")
			)));
	}

	@Test
	void loginShouldNotSetRememberMeCookieWhenCheckboxIsNotChecked() throws Exception {
		mockMvc.perform(post("/login")
				.with(csrf())
				.param("username", "admin")
				.param("password", "admin"))
			.andExpect(status().is3xxRedirection())
			.andExpect(redirectedUrl("/"))
			.andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Set-Cookie", org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("remember-me="))));
	}

	@Test
	@WithMockUser(username = "admin")
	void logoutShouldExplicitlyClearRememberMeCookie() throws Exception {
		mockMvc.perform(post("/logout")
				.with(csrf()))
			.andExpect(status().is3xxRedirection())
			.andExpect(redirectedUrl("/login?logout"))
			.andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().stringValues(
				"Set-Cookie",
				org.hamcrest.Matchers.hasItem(org.hamcrest.Matchers.allOf(
					org.hamcrest.Matchers.containsString("remember-me="),
					org.hamcrest.Matchers.containsString("Max-Age=0")
				))
			));
	}

	@Test
	void loginCssShouldBeAccessibleWithoutAuthentication() throws Exception {
		mockMvc.perform(get("/css/login.css"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString(".panel")));
	}

	@Test
	void materialSymbolsFontShouldBeAccessibleWithoutAuthentication() throws Exception {
		mockMvc.perform(get("/fonts/MaterialSymbolsOutlined/webfonts/material-symbols-outlined-latin-400-normal.woff2"))
			.andExpect(status().isOk())
			.andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Content-Type", org.hamcrest.Matchers.containsString("font/woff2")));
	}

	@Test
	void rootShouldRedirectToLoginWhenUnauthenticated() throws Exception {
		mockMvc.perform(get("/"))
			.andExpect(status().is3xxRedirection())
			.andExpect(redirectedUrl("/login"));
	}

	@Test
	void accessTokenApiShouldRedirectToLoginWhenUnauthenticated() throws Exception {
		mockMvc.perform(get("/api/access-tokens"))
			.andExpect(status().is3xxRedirection())
			.andExpect(redirectedUrl("/login"));
	}

	@Test
	void swaggerUiShouldRedirectToLoginWhenUnauthenticated() throws Exception {
		mockMvc.perform(get("/swagger-ui/index.html"))
			.andExpect(status().is3xxRedirection())
			.andExpect(redirectedUrl("/login"));
	}

	@Test
	void apiDocsShouldRedirectToLoginWhenUnauthenticated() throws Exception {
		mockMvc.perform(get("/api-docs"))
			.andExpect(status().is3xxRedirection())
			.andExpect(redirectedUrl("/login"));
	}

	@Test
	void h2ConsoleShouldRedirectToLoginWhenUnauthenticated() throws Exception {
		mockMvc.perform(get("/h2-console"))
			.andExpect(status().is3xxRedirection())
			.andExpect(redirectedUrl("/login"));
	}

	@Test
	@WithMockUser(username = "admin")
	void rootShouldRenderForAuthenticatedUser() throws Exception {
		mockMvc.perform(get("/"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Dashboard")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("admin")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Report Template")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("href=\"/report-templates/edit\"")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Create New Report")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Connected Databases")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Active API Keys")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Settings")))
			.andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("Upload Jasper Template"))));
	}

	@Test
	@WithMockUser(username = "admin")
	void settingsPageShouldRenderForAuthenticatedUser() throws Exception {
		mockMvc.perform(get("/settings")
				.secure(true)
				.header("Host", "settings.example.test"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("General")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Generated Report Cleanup Schedule")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("cleanup-enabled")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("cleanup-timezone")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("download-base-url")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("placeholder=\"http://settings.example.test\"")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("settings.js")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Clear Logs and Generated Files")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Clear All System Data")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Asia/Bangkok")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("summary-cleanup-timezone")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("summary-download-base-url")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("summary-next-cleanup")));
	}

	@Test
	@WithMockUser(username = "admin")
	void settingsApiShouldPersistCleanupSchedule() throws Exception {
		mockMvc.perform(put("/api/settings")
				.with(csrf())
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "cleanupEnabled": false,
					  "cleanupFrequency": "Weekly",
					  "cleanupTime": "03:15",
					  "cleanupTimezone": "UTC",
					  "downloadBaseUrl": "https://report-service.domain.com/"
					}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.cleanupEnabled").value(false))
			.andExpect(jsonPath("$.cleanupStatus").value("Disabled"))
			.andExpect(jsonPath("$.cleanupFrequency").value("Weekly"))
			.andExpect(jsonPath("$.cleanupTime").value("03:15"))
			.andExpect(jsonPath("$.cleanupTimezone").value("UTC"))
			.andExpect(jsonPath("$.cleanupTimezoneLabel").value("UTC (UTC+00:00)"))
			.andExpect(jsonPath("$.downloadBaseUrl").value("https://report-service.domain.com"))
			.andExpect(jsonPath("$.downloadBaseUrlDisplay").value("https://report-service.domain.com"))
			.andExpect(jsonPath("$.cleanupDescription").value("weekly on Monday at 03:15"))
			.andExpect(jsonPath("$.nextCleanupAt").value("-"));

		mockMvc.perform(get("/api/settings"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.cleanupEnabled").value(false))
			.andExpect(jsonPath("$.cleanupFrequency").value("Weekly"))
			.andExpect(jsonPath("$.cleanupTime").value("03:15"))
			.andExpect(jsonPath("$.cleanupTimezone").value("UTC"))
			.andExpect(jsonPath("$.cleanupTimezoneLabel").value("UTC (UTC+00:00)"))
			.andExpect(jsonPath("$.downloadBaseUrl").value("https://report-service.domain.com"));

		assertAuditLogRecorded("System Settings Updated", "Settings", "Updated generated report cleanup schedule to disabled weekly on Monday at 03:15 and set the download base URL to https://report-service.domain.com.", "Completed");
	}

	@Test
	@WithMockUser(username = "admin")
	void settingsApiShouldUseAutoDetectedDownloadBaseUrlWhenUnset() throws Exception {
		mockMvc.perform(put("/api/settings")
				.with(csrf())
				.secure(true)
				.header("Host", "settings-api.example.test")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "cleanupEnabled": true,
					  "cleanupFrequency": "Monthly",
					  "cleanupTime": "05:00",
					  "cleanupTimezone": "Asia/Bangkok",
					  "downloadBaseUrl": ""
					}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.downloadBaseUrl").value(""))
			.andExpect(jsonPath("$.downloadBaseUrlDisplay").value("http://settings-api.example.test"))
			.andExpect(jsonPath("$.autoDetectedDownloadBaseUrl").value("http://settings-api.example.test"));

		mockMvc.perform(get("/api/settings")
				.secure(true)
				.header("Host", "settings-api.example.test"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.downloadBaseUrl").value(""))
			.andExpect(jsonPath("$.downloadBaseUrlDisplay").value("http://settings-api.example.test"))
			.andExpect(jsonPath("$.autoDetectedDownloadBaseUrl").value("http://settings-api.example.test"));

		assertAuditLogRecorded("System Settings Updated", "Settings", "Updated generated report cleanup schedule to enabled monthly on day 1 at 05:00 and cleared the download base URL.", "Completed");
	}

	@Test
	@WithMockUser(username = "admin")
	void dashboardShouldRenderLatestThreeAuditEvents() throws Exception {
		createAuditEvent("Report Generated", "Generated file monthly-sales.pdf", "reports-api", "Monthly Sales", "Completed", java.time.LocalDateTime.now().minusMinutes(1));
		createAuditEvent("Data Source Tested", "Connection test failed for Warehouse Link", "admin", "Warehouse Link", "Failed", java.time.LocalDateTime.now().minusMinutes(2));
		createAuditEvent("Access Token Updated", "Generated token value for Partner API", "admin", "Partner API", "Completed", java.time.LocalDateTime.now().minusMinutes(3));
		createAuditEvent("Report Template Updated", "Updated template Legacy Template", "admin", "Legacy Template", "Completed", java.time.LocalDateTime.now().minusMinutes(4));

		mockMvc.perform(get("/"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Recent Activity")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Latest 3 audit log events")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Report Generated")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Generated file monthly-sales.pdf • reports-api")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Data Source Tested")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Connection test failed for Warehouse Link • admin")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Access Token Updated")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Generated token value for Partner API • admin")))
			.andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("Legacy Template"))));
	}

	@Test
	@WithMockUser(username = "admin")
	void reportsPageShouldRenderReportTemplatesAndSelectedDownloadFiles() throws Exception {
		DataSourceConfig dataSourceConfig = createSavedDataSource("Warehouse Link");
		java.nio.file.Files.createDirectories(TEST_UPLOADS_DIR);
		java.nio.file.Files.createDirectories(TEST_GENERATED_DIR);
		java.nio.file.Path storedJrxml = TEST_UPLOADS_DIR.resolve("reports-page-template.jrxml");
		java.nio.file.Path storedJasper = TEST_GENERATED_DIR.resolve("reports-page-template.jasper");
		java.nio.file.Files.writeString(storedJrxml, "<jrxml/>");
		java.nio.file.Files.write(storedJasper, new byte[] { 1, 2, 3 });

		ReportTemplate reportTemplate = new ReportTemplate();
		reportTemplate.setTemplateCode("A4REPORT");
		reportTemplate.setTemplateName("A4Report");
		reportTemplate.setDescription("Main report template");
		reportTemplate.setDataSourceConfig(dataSourceConfig);
		reportTemplate.setOriginalFileName("reports-page-template.jrxml");
		reportTemplate.setJrxmlStoragePath(storedJrxml.toAbsolutePath().toString());
		reportTemplate.setJasperStoragePath(storedJasper.toAbsolutePath().toString());
		reportTemplate.setParameterSchemaJson("[]");
		reportTemplate = reportTemplateRepository.save(reportTemplate);

		GeneratedReportFile generatedReportFile = new GeneratedReportFile();
		generatedReportFile.setReportTemplateId(reportTemplate.getId());
		generatedReportFile.setReportTemplateName("A4Report");
		generatedReportFile.setOutputFormat("pdf");
		generatedReportFile.setDownloadFileName("A4Report-20260326-104500.pdf");
		generatedReportFile.setStoragePath(TEST_REPORTS_DIR.resolve("seed.pdf").toAbsolutePath().toString());
		generatedReportFile.setParametersJson("{}");
		generatedReportFile.setFileSizeBytes(1234L);
		generatedReportFile.setGeneratedByTokenId(1L);
		generatedReportFile.setGeneratedByTokenName("reports-api");
		generatedReportFile = generatedReportFileRepository.save(generatedReportFile);

		mockMvc.perform(get("/reports")
				.param("selectedTemplateId", reportTemplate.getId().toString())
				.with(request -> {
					request.setScheme("https");
					request.setSecure(true);
					request.setServerPort(443);
					return request;
				})
				.header("Host", "reports.example.test"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Reports")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("<th>ID</th>")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("<th>Template Code</th>")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("<th>Template Name</th>")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("A4Report")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("A4REPORT")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString(">" + reportTemplate.getId() + "</td>")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Warehouse Link")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Generated files for A4Report.")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("pill pill--danger")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString(">" + generatedReportFile.getId() + "</td>")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("target=\"_blank\"")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("rel=\"noopener noreferrer\"")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("https://reports.example.test/reports/files/" + generatedReportFile.getId() + "/download")));
	}

	@Test
	@WithMockUser(username = "admin")
	void reportsPageShouldUseConfiguredDownloadBaseUrlForDownloadLinks() throws Exception {
		systemSettingsService.updateSettings(new SystemSettingsService.SettingsSaveRequest(true, "Monthly", "05:00", "Asia/Bangkok", "https://report-service.domain.com/"));
		DataSourceConfig dataSourceConfig = createSavedDataSource("Warehouse Link");
		ReportTemplate reportTemplate = createSavedReportTemplate(dataSourceConfig, "ConfiguredReportsBase", "CONFIGREPORT01");
		GeneratedReportFile generatedReportFile = createGeneratedReportFile(reportTemplate, "ConfiguredReportsBase-20260326-104500.pdf", "pdf", "reports-api");

		mockMvc.perform(get("/reports")
				.param("selectedTemplateId", reportTemplate.getId().toString())
				.header("Host", "ignored-by-setting.example.com"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("https://report-service.domain.com/reports/files/" + generatedReportFile.getId() + "/download")));
	}

	@Test
	@WithMockUser(username = "admin")
	void reportsPageShouldRenderFormatSpecificBadgeColors() throws Exception {
		DataSourceConfig dataSourceConfig = createSavedDataSource("Warehouse Link");
		ReportTemplate reportTemplate = createSavedReportTemplate(dataSourceConfig, "FormatColors");

		createGeneratedReportFile(reportTemplate, "FormatColors-1.pdf", "pdf", "reports-api");
		createGeneratedReportFile(reportTemplate, "FormatColors-2.docx", "docx", "reports-api");
		createGeneratedReportFile(reportTemplate, "FormatColors-3.xlsx", "xlsx", "reports-api");

		mockMvc.perform(get("/reports").param("selectedTemplateId", reportTemplate.getId().toString()))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("pill pill--danger")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("pill pill--info")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("pill pill--success")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString(">PDF<")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString(">DOCX<")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString(">XLSX<")));
	}

	@Test
	@WithMockUser(username = "admin")
	void automaticCleanupShouldDeleteStoredFileAndBlockFutureDownloads() throws Exception {
		DataSourceConfig dataSourceConfig = createSavedDataSource("Primary");
		ReportTemplate reportTemplate = createSavedReportTemplate(dataSourceConfig, "Auto Cleanup Template", "AUTOCLEANUP1");
		java.nio.file.Files.createDirectories(TEST_REPORTS_DIR);
		java.nio.file.Path storedReport = TEST_REPORTS_DIR.resolve("auto-cleanup-report.pdf");
		java.nio.file.Files.write(storedReport, new byte[] { 1, 2, 3, 4 });
		GeneratedReportFile generatedReportFile = createGeneratedReportFile(reportTemplate, storedReport.getFileName().toString(), "pdf", "reports-api");

		systemSettingsService.updateSettings(new SystemSettingsService.SettingsSaveRequest(true, "Daily", "00:05", "Asia/Bangkok", null));
		systemSettingsService.runAutomaticGeneratedReportCleanup(java.time.LocalDateTime.of(2026, 3, 27, 0, 5));

		GeneratedReportFile refreshedFile = generatedReportFileRepository.findById(generatedReportFile.getId()).orElseThrow();
		org.assertj.core.api.Assertions.assertThat(refreshedFile.isFileDeleted()).isTrue();
		// Persisted as the UTC-equivalent of 2026-03-27T00:05 Asia/Bangkok (UTC+7), matching every other stored timestamp.
		org.assertj.core.api.Assertions.assertThat(refreshedFile.getFileDeletedAt()).isEqualTo(java.time.LocalDateTime.of(2026, 3, 26, 17, 5));
		org.assertj.core.api.Assertions.assertThat(storedReport).doesNotExist();

		String reportsPage = mockMvc.perform(get("/reports").param("selectedTemplateId", reportTemplate.getId().toString()))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Deleted")))
			.andReturn()
			.getResponse()
			.getContentAsString();

		org.assertj.core.api.Assertions.assertThat(reportsPage).doesNotContain("/reports/files/" + generatedReportFile.getId() + "/download");

		mockMvc.perform(get("/reports/files/{id}/download", generatedReportFile.getId()))
			.andExpect(status().isNotFound());

		assertAuditLogRecorded("Generated Reports Auto Cleanup", "Settings", "Automatically deleted 1 generated report file(s)", "Completed");
	}

	@Test
	@WithMockUser(username = "admin")
	void automaticCleanupShouldNotRunWhenDisabled() throws Exception {
		DataSourceConfig dataSourceConfig = createSavedDataSource("Primary");
		ReportTemplate reportTemplate = createSavedReportTemplate(dataSourceConfig, "Disabled Cleanup Template", "DISABLEDCLEAN1");
		java.nio.file.Files.createDirectories(TEST_REPORTS_DIR);
		java.nio.file.Path storedReport = TEST_REPORTS_DIR.resolve("disabled-auto-cleanup-report.pdf");
		java.nio.file.Files.write(storedReport, new byte[] { 5, 6, 7, 8 });
		GeneratedReportFile generatedReportFile = createGeneratedReportFile(reportTemplate, storedReport.getFileName().toString(), "pdf", "reports-api");

		systemSettingsService.updateSettings(new SystemSettingsService.SettingsSaveRequest(false, "Monthly", "05:00", "Asia/Bangkok", null));
		SystemSettingsService.CleanupActionResponse response = systemSettingsService.runAutomaticGeneratedReportCleanup(java.time.LocalDateTime.of(2026, 4, 1, 5, 0));

		org.assertj.core.api.Assertions.assertThat(response.message()).isEqualTo("Automatic generated report cleanup is disabled.");
		GeneratedReportFile refreshedFile = generatedReportFileRepository.findById(generatedReportFile.getId()).orElseThrow();
		org.assertj.core.api.Assertions.assertThat(refreshedFile.isFileDeleted()).isFalse();
		org.assertj.core.api.Assertions.assertThat(storedReport).exists();
		org.assertj.core.api.Assertions.assertThat(auditLogEventRepository.findAll())
			.extracting(AuditLogEvent::getEventName)
			.doesNotContain("Generated Reports Auto Cleanup");
	}

	@Test
	@WithMockUser(username = "admin")
	void clearGeneratedFilesAndLogsApiShouldPreserveTemplatesAndCleanupHistory() throws Exception {
		DataSourceConfig dataSourceConfig = createSavedDataSource("Primary");
		ReportTemplate reportTemplate = createSavedReportTemplate(dataSourceConfig, "Cleanup Template", "CLEANUPTEMP1");
		createSavedAccessToken("Cleanup Token", "Active");
		java.nio.file.Files.createDirectories(TEST_REPORTS_DIR);
		java.nio.file.Path storedReport = TEST_REPORTS_DIR.resolve("cleanup-file.pdf");
		java.nio.file.Files.write(storedReport, new byte[] { 9, 8, 7 });
		createGeneratedReportFile(reportTemplate, storedReport.getFileName().toString(), "pdf", "reports-api");
		createAuditEvent("Report Generated", "Generated file cleanup-file.pdf", "reports-api", "Cleanup Template", "Completed", java.time.LocalDateTime.now().minusMinutes(5));

		mockMvc.perform(post("/api/settings/cleanup/generated-files-and-logs").with(csrf()))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.deletedGeneratedFiles").value(1))
			.andExpect(jsonPath("$.deletedTemplates").value(0))
			.andExpect(jsonPath("$.deletedDataSources").value(0))
			.andExpect(jsonPath("$.deletedAccessTokens").value(0));

		org.assertj.core.api.Assertions.assertThat(generatedReportFileRepository.count()).isZero();
		org.assertj.core.api.Assertions.assertThat(reportTemplateRepository.count()).isEqualTo(1);
		org.assertj.core.api.Assertions.assertThat(dataSourceConfigRepository.count()).isEqualTo(1);
		org.assertj.core.api.Assertions.assertThat(accessTokenRepository.count()).isEqualTo(1);
		org.assertj.core.api.Assertions.assertThat(storedReport).doesNotExist();
		org.assertj.core.api.Assertions.assertThat(auditLogEventRepository.findAll())
			.extracting(AuditLogEvent::getEventName)
			.containsExactly("System Cleanup Executed");
	}

	@Test
	@WithMockUser(username = "admin")
	void clearAllSystemDataApiShouldDeleteSystemDataAndPreserveCleanupHistory() throws Exception {
		DataSourceConfig dataSourceConfig = createSavedDataSource("Primary");
		ReportTemplate reportTemplate = createSavedReportTemplate(dataSourceConfig, "Reset Template", "RESETTEMP1");
		createSavedAccessToken("Reset Token", "Active");
		java.nio.file.Files.createDirectories(TEST_REPORTS_DIR);
		java.nio.file.Path storedReport = TEST_REPORTS_DIR.resolve("reset-file.pdf");
		java.nio.file.Files.write(storedReport, new byte[] { 3, 2, 1 });
		createGeneratedReportFile(reportTemplate, storedReport.getFileName().toString(), "pdf", "reports-api");
		createAuditEvent("Report Generated", "Generated file reset-file.pdf", "reports-api", "Reset Template", "Completed", java.time.LocalDateTime.now().minusMinutes(5));

		mockMvc.perform(post("/api/settings/cleanup/all").with(csrf()))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.deletedGeneratedFiles").value(1))
			.andExpect(jsonPath("$.deletedTemplates").value(1))
			.andExpect(jsonPath("$.deletedDataSources").value(1))
			.andExpect(jsonPath("$.deletedAccessTokens").value(1));

		org.assertj.core.api.Assertions.assertThat(generatedReportFileRepository.count()).isZero();
		org.assertj.core.api.Assertions.assertThat(reportTemplateRepository.count()).isZero();
		org.assertj.core.api.Assertions.assertThat(dataSourceConfigRepository.count()).isZero();
		org.assertj.core.api.Assertions.assertThat(accessTokenRepository.count()).isZero();
		org.assertj.core.api.Assertions.assertThat(reportDownloadLogRepository.count()).isZero();
		org.assertj.core.api.Assertions.assertThat(storedReport).doesNotExist();
		org.assertj.core.api.Assertions.assertThat(auditLogEventRepository.findAll())
			.extracting(AuditLogEvent::getEventName)
			.containsExactly("System Reset Executed");
	}

	@Test
	@WithMockUser(username = "admin")
	void reportTemplatesShouldRenderForAuthenticatedUser() throws Exception {
		mockMvc.perform(get("/report-templates"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Report Templates")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("report-templates.js")));
	}

	@Test
	@WithMockUser(username = "admin")
	void reportTemplateEditPageShouldRenderDownloadButton() throws Exception {
		mockMvc.perform(get("/report-templates/edit"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("template-code")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("pattern=\"[A-Z0-9]*\"")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("field-grid")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("report-template-parameters-card")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("download-template-file")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("generate-format")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("report-template-generate-format")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("template-preview-feedback-alert")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("<option value=\"pdf\" selected>PDF</option>")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("<option value=\"docx\">DOCX</option>")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("<option value=\"xlsx\">XLSX</option>")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("generate-template")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("action-button--neutral report-template-generate-button")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("button-row--stacked")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Download JRXML")));
	}

	@Test
	@WithMockUser(username = "admin")
	void reportTemplateEditPageShouldRenderDirtyFormHooks() throws Exception {
		mockMvc.perform(get("/report-templates/edit"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("toast.js")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("template-feedback-alert")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("report-template-edit.js")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("save-template-modal")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("unsaved-template-modal")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("report-preview-modal")));
	}

	@Test
	@WithMockUser(username = "admin")
	void reportTemplateEditScriptShouldIncludeLeaveFlowBeforeUnloadGuard() throws Exception {
		mockMvc.perform(get("/js/report-template-edit.js"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("suppressBeforeUnload")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("window.location.assign(href)")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("if (suppressBeforeUnload || !isDirty())")));
	}

	@Test
	@WithMockUser(username = "admin")
	void reportTemplateEditScriptShouldIncludeParameterCopyAction() throws Exception {
		mockMvc.perform(get("/js/report-template-edit.js"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("window.AppToast?.create")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("const activeToast = previewDialog.open ? previewFeedbackToast : feedbackToast;")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Complete the required fields before saving the report template.")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Template Code is already in use by another report template.")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("const fetchExistingTemplates = async () => {")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("fields.templateCode.setCustomValidity(duplicateMessage);")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("existingTemplates.find((template) => normalizeTemplateCode(template.templateCode) === templateCode && Number(template.id) !== currentTemplateId)")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("upload-box--invalid")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("field.classList.toggle('is-invalid', invalid)")))
			.andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("selectedOption?.textContent ? selectedOption.textContent.split(' • ')[0] : '-'"))))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("content_copy")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("label.textContent = parameter.name")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("placeholder = `Enter ${parameter.name}`")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("replace(/[^A-Z0-9]/g, '')")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Copy parameter name")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("copied to clipboard")));
	}

	@Test
	@WithMockUser(username = "admin")
	void reportTemplateEditScriptShouldIncludeAdminGenerateAction() throws Exception {
		mockMvc.perform(get("/js/report-template-edit.js"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("generate-format")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("generate-template")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("const selectedFormat = currentGenerateFormat()")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("/generate")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("report generated successfully. Download starting for")));
	}

	@Test
	@WithMockUser(username = "admin")
	void editPageCssShouldKeepReportTemplateSidebarCardsFromOverlapping() throws Exception {
		mockMvc.perform(get("/css/edit-page.css"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString(".report-template-edit-page .summary-card")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("position: static;")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString(".status-alert--toast")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("position: fixed;")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("right: 24px;")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString(".field--invalid label")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString(".field input.is-invalid")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString(".option-grid--invalid")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString(".upload-box--invalid")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString(".parameter-list .field-grid")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("grid-template-columns: minmax(0, 1fr);")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("text-transform: none;")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString(".report-template-generate-format")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString(".report-template-generate-button")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("width: 100%;")));
	}

	@Test
	@WithMockUser(username = "admin")
	void reportTemplatesShouldRenderPersistedRows() throws Exception {
		DataSourceConfig dataSourceConfig = createSavedDataSource("Warehouse Link");
		java.nio.file.Files.createDirectories(TEST_UPLOADS_DIR);
		java.nio.file.Files.createDirectories(TEST_GENERATED_DIR);
		java.nio.file.Path storedJrxml = TEST_UPLOADS_DIR.resolve("seed-sales-summary.jrxml");
		java.nio.file.Path storedJasper = TEST_GENERATED_DIR.resolve("seed-sales-summary.jasper");
		java.nio.file.Files.writeString(storedJrxml, "<jrxml/>");
		java.nio.file.Files.write(storedJasper, new byte[] { 1, 2, 3 });
		ReportTemplate reportTemplate = new ReportTemplate();
		reportTemplate.setTemplateCode("SALESSUMMARY");
		reportTemplate.setTemplateName("Sales Summary");
		reportTemplate.setDescription("Monthly sales summary");
		reportTemplate.setDataSourceConfig(dataSourceConfig);
		reportTemplate.setOriginalFileName("sales-summary.jrxml");
		reportTemplate.setJrxmlStoragePath(storedJrxml.toAbsolutePath().toString());
		reportTemplate.setJasperStoragePath(storedJasper.toAbsolutePath().toString());
		reportTemplate.setParameterSchemaJson("[]");
		reportTemplateRepository.save(reportTemplate);

		String responseBody = mockMvc.perform(get("/report-templates"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("<th>ID</th>")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("<th>Template Code</th>")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Sales Summary")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("SALESSUMMARY")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString(">" + reportTemplate.getId() + "</td>")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Warehouse Link")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("delete-report-template-modal")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("/api/report-templates/" + reportTemplate.getId() + "/jrxml")))
			.andReturn()
			.getResponse()
			.getContentAsString();

		org.assertj.core.api.Assertions.assertThat(responseBody).doesNotContain("<p>Warehouse Link</p>");
	}

	@Test
	@WithMockUser(username = "admin")
	void tableTimestampsShouldRespectConfiguredSettingsTimezoneAcrossPages() throws Exception {
		systemSettingsService.updateSettings(new SystemSettingsService.SettingsSaveRequest(true, "Monthly", "05:00", "America/New_York", null));
		java.time.LocalDateTime storedTimestamp = java.time.LocalDateTime.of(2026, 3, 27, 10, 0);
		String expectedTimestamp = "27 Mar 2026, 06:00";

		DataSourceConfig dataSourceConfig = createSavedDataSource("Warehouse Link");
		dataSourceConfig.setLastTestStatus("Connected");
		dataSourceConfig.setLastTestedAt(storedTimestamp);
		dataSourceConfigRepository.save(dataSourceConfig);

		AccessToken token = createSavedAccessToken("Timezone Token", "Active");
		token.setCreatedAt(storedTimestamp);
		token.setLastUsedAt(storedTimestamp);
		accessTokenRepository.save(token);

		ReportTemplate reportTemplate = createSavedReportTemplate(dataSourceConfig, "Timezone Template", "TIMEZONE001");
		reportTemplate.setUpdatedAt(storedTimestamp);
		reportTemplate.setUploadedAt(storedTimestamp);
		reportTemplateRepository.save(reportTemplate);

		java.nio.file.Files.createDirectories(TEST_REPORTS_DIR);
		java.nio.file.Path storedReport = TEST_REPORTS_DIR.resolve("timezone-report.pdf");
		java.nio.file.Files.write(storedReport, new byte[] { 1, 2, 3 });
		GeneratedReportFile generatedReportFile = createGeneratedReportFile(reportTemplate, storedReport.getFileName().toString(), "pdf", "reports-api");
		generatedReportFile.setGeneratedAt(storedTimestamp);
		generatedReportFileRepository.save(generatedReportFile);

		createAuditEvent("Report Generated", "Generated file timezone-report.pdf", "reports-api", "Timezone Template", "Completed", storedTimestamp);

		mockMvc.perform(get("/report-templates"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString(expectedTimestamp)));

		mockMvc.perform(get("/access-tokens"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString(expectedTimestamp)));

		mockMvc.perform(get("/data-sources"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString(expectedTimestamp)));

		mockMvc.perform(get("/reports").param("selectedTemplateId", reportTemplate.getId().toString()))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString(expectedTimestamp)));

		mockMvc.perform(get("/audit-logs"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString(expectedTimestamp)));
	}

	@Test
	@WithMockUser(username = "admin")
	void reportTemplatesShouldRenderRealPagination() throws Exception {
		DataSourceConfig dataSourceConfig = createSavedDataSource("Primary");
		java.nio.file.Files.createDirectories(TEST_UPLOADS_DIR);
		java.nio.file.Files.createDirectories(TEST_GENERATED_DIR);
		for (int index = 1; index <= 12; index++) {
			java.nio.file.Path storedJrxml = TEST_UPLOADS_DIR.resolve("template-" + index + ".jrxml");
			java.nio.file.Path storedJasper = TEST_GENERATED_DIR.resolve("template-" + index + ".jasper");
			java.nio.file.Files.writeString(storedJrxml, "<jrxml/>\n");
			java.nio.file.Files.write(storedJasper, new byte[] { 1, 2, 3 });
			ReportTemplate reportTemplate = new ReportTemplate();
			reportTemplate.setTemplateCode("TEMPLATE" + index);
			reportTemplate.setTemplateName("Template " + index);
			reportTemplate.setDescription("Template " + index);
			reportTemplate.setDataSourceConfig(dataSourceConfig);
			reportTemplate.setOriginalFileName("template-" + index + ".jrxml");
			reportTemplate.setJrxmlStoragePath(storedJrxml.toAbsolutePath().toString());
			reportTemplate.setJasperStoragePath(storedJasper.toAbsolutePath().toString());
			reportTemplate.setParameterSchemaJson("[]");
			reportTemplateRepository.save(reportTemplate);
		}

		mockMvc.perform(get("/report-templates").param("page", "1").param("size", "5"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Showing 6-10 of 12 templates")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString(">2<")));
	}

	@Test
	@WithMockUser(username = "admin")
	void reportTemplateDownloadShouldReturnSavedJrxml() throws Exception {
		DataSourceConfig dataSourceConfig = createSavedDataSource("Primary");
		java.nio.file.Files.createDirectories(TEST_UPLOADS_DIR);
		java.nio.file.Files.createDirectories(TEST_GENERATED_DIR);
		java.nio.file.Path storedJrxml = TEST_UPLOADS_DIR.resolve("download-template.jrxml");
		java.nio.file.Path storedJasper = TEST_GENERATED_DIR.resolve("download-template.jasper");
		java.nio.file.Files.writeString(storedJrxml, "<report/>");
		java.nio.file.Files.write(storedJasper, new byte[] { 1, 2, 3 });
		ReportTemplate reportTemplate = new ReportTemplate();
		reportTemplate.setTemplateCode("DOWNLOADTEMPLATE");
		reportTemplate.setTemplateName("Download Template");
		reportTemplate.setDescription("Download Template");
		reportTemplate.setDataSourceConfig(dataSourceConfig);
		reportTemplate.setOriginalFileName("download-template.jrxml");
		reportTemplate.setJrxmlStoragePath(storedJrxml.toAbsolutePath().toString());
		reportTemplate.setJasperStoragePath(storedJasper.toAbsolutePath().toString());
		reportTemplate.setParameterSchemaJson("[]");
		reportTemplate = reportTemplateRepository.save(reportTemplate);

		mockMvc.perform(get("/api/report-templates/{id}/jrxml", reportTemplate.getId()))
			.andExpect(status().isOk())
			.andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Content-Disposition", org.hamcrest.Matchers.containsString("download-template.jrxml")))
			.andExpect(content().string("<report/>"));
	}

	@Test
	@WithMockUser(username = "admin")
	void reportTemplateUploadSavePreviewAndDeleteShouldWork() throws Exception {
		DataSourceConfig dataSourceConfig = createSavedDataSource("Primary");
		MockMultipartFile jrxml = new MockMultipartFile(
			"file",
			"sales-summary.jrxml",
			MediaType.TEXT_XML_VALUE,
			minimalJrxml().getBytes(java.nio.charset.StandardCharsets.UTF_8)
		);

		var uploadResult = mockMvc.perform(multipart("/api/report-templates/upload")
					.file(jrxml)
					.with(csrf()))
			.andReturn();

		org.assertj.core.api.Assertions.assertThat(uploadResult.getResponse().getStatus())
			.withFailMessage(uploadResult.getResponse().getContentAsString())
			.isEqualTo(200);

		String uploadResponse = uploadResult.getResponse().getContentAsString();
		var uploadJson = new com.fasterxml.jackson.databind.ObjectMapper().readTree(uploadResponse);
		org.assertj.core.api.Assertions.assertThat(uploadJson.get("uploadToken").asText()).isNotBlank();
		org.assertj.core.api.Assertions.assertThat(uploadJson.get("originalFileName").asText()).isEqualTo("sales-summary.jrxml");
		org.assertj.core.api.Assertions.assertThat(uploadJson.at("/parameters/0/name").asText()).isEqualTo("start_date");
		org.assertj.core.api.Assertions.assertThat(uploadJson.at("/parameters/0/label").asText()).isEqualTo("start_date");

		String uploadToken = new com.fasterxml.jackson.databind.ObjectMapper().readTree(uploadResponse).get("uploadToken").asText();
		org.assertj.core.api.Assertions.assertThat(TEST_UPLOADS_DIR).exists();
		org.assertj.core.api.Assertions.assertThat(TEST_GENERATED_DIR).exists();
		org.assertj.core.api.Assertions.assertThat(TEST_UPLOADS_DIR.resolve(uploadToken + "-sales-summary.jrxml")).exists();
		org.assertj.core.api.Assertions.assertThat(TEST_GENERATED_DIR.resolve(uploadToken + ".jasper")).exists();
		org.assertj.core.api.Assertions.assertThat(TEST_GENERATED_DIR.resolve(uploadToken + ".json")).exists();

		mockMvc.perform(get("/api/report-templates/download").param("uploadToken", uploadToken))
			.andExpect(status().isOk())
			.andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Content-Disposition", org.hamcrest.Matchers.containsString("sales-summary.jrxml")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("sample_report")));

		String createResponse = mockMvc.perform(post("/api/report-templates")
					.with(csrf())
					.contentType(MediaType.APPLICATION_JSON)
					.content("""
						{
						  "templateCode": "SALESSUMMARY1",
						  "templateName": "Sales Summary",
						  "description": "Monthly sales summary",
						  "dataSourceId": %d,
						  "uploadToken": "%s"
						}
						""".formatted(dataSourceConfig.getId(), uploadToken)))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.id").isNumber())
			.andExpect(jsonPath("$.templateCode").value("SALESSUMMARY1"))
			.andExpect(jsonPath("$.templateName").value("Sales Summary"))
			.andExpect(jsonPath("$.dataSourceName").value("Primary"))
			.andExpect(jsonPath("$.parameters[0].name").value("start_date"))
			.andReturn()
			.getResponse()
			.getContentAsString();

		long templateId = new com.fasterxml.jackson.databind.ObjectMapper().readTree(createResponse).get("id").asLong();
		org.assertj.core.api.Assertions.assertThat(TEST_UPLOADS_DIR.resolve(uploadToken + "-sales-summary.jrxml")).doesNotExist();
		org.assertj.core.api.Assertions.assertThat(TEST_GENERATED_DIR.resolve(uploadToken + ".json")).doesNotExist();
		ReportTemplate savedTemplate = reportTemplateRepository.findById(templateId).orElseThrow();
		org.assertj.core.api.Assertions.assertThat(savedTemplate.getTemplateCode()).isEqualTo("SALESSUMMARY1");
		org.assertj.core.api.Assertions.assertThat(savedTemplate.getJrxmlStoragePath()).isNotBlank();
		org.assertj.core.api.Assertions.assertThat(savedTemplate.getJasperStoragePath()).isNotBlank();
		org.assertj.core.api.Assertions.assertThat(java.nio.file.Path.of(savedTemplate.getJrxmlStoragePath())).exists();
		org.assertj.core.api.Assertions.assertThat(java.nio.file.Path.of(savedTemplate.getJasperStoragePath())).exists();
		assertAuditLogRecorded("Report Template Created", "Sales Summary", "Created template Sales Summary", "Completed");

		mockMvc.perform(post("/api/report-templates/preview")
					.with(csrf())
					.contentType(MediaType.APPLICATION_JSON)
					.accept(MediaType.APPLICATION_PDF)
					.content("""
						{
						  "templateId": %d,
						  "dataSourceId": %d,
						  "parameters": {
						    "start_date": "2026-03-25"
						  }
						}
						""".formatted(templateId, dataSourceConfig.getId())))
			.andExpect(status().isOk())
			.andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Content-Type", org.hamcrest.Matchers.containsString(MediaType.APPLICATION_PDF_VALUE)));

		assertAuditLogRecorded("Report Previewed", "Sales Summary", "Generated preview. Parameters: ", "Completed");
		assertAuditLogDetailContains("Report Previewed", "Sales Summary", "Completed", "\"start_date\":\"2026-03-25\"");

		mockMvc.perform(delete("/api/report-templates/{id}", templateId).with(csrf()))
			.andExpect(status().isNoContent());

		org.assertj.core.api.Assertions.assertThat(reportTemplateRepository.existsById(templateId)).isFalse();
		org.assertj.core.api.Assertions.assertThat(java.nio.file.Path.of(savedTemplate.getJrxmlStoragePath())).doesNotExist();
		org.assertj.core.api.Assertions.assertThat(java.nio.file.Path.of(savedTemplate.getJasperStoragePath())).doesNotExist();
		assertAuditLogRecorded("Report Template Deleted", "Sales Summary", "Deleted template Sales Summary", "Completed");
	}

	@Test
	@WithMockUser(username = "admin")
	void reportTemplateApiShouldAllowOptionalDescriptionAndDataSource() throws Exception {
		MockMultipartFile jrxml = new MockMultipartFile(
			"file",
			"optional-template.jrxml",
			MediaType.TEXT_XML_VALUE,
			minimalJrxml().getBytes(java.nio.charset.StandardCharsets.UTF_8)
		);

		String uploadResponse = mockMvc.perform(multipart("/api/report-templates/upload")
				.file(jrxml)
				.with(csrf()))
			.andExpect(status().isOk())
			.andReturn()
			.getResponse()
			.getContentAsString();

		String uploadToken = new com.fasterxml.jackson.databind.ObjectMapper().readTree(uploadResponse).get("uploadToken").asText();

		String createResponse = mockMvc.perform(post("/api/report-templates")
				.with(csrf())
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "templateCode": "OPTIONAL001",
					  "templateName": "Optional Template",
					  "description": "",
					  "uploadToken": "%s"
					}
					""".formatted(uploadToken)))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.templateCode").value("OPTIONAL001"))
			.andExpect(jsonPath("$.templateName").value("Optional Template"))
			.andExpect(jsonPath("$.description").value(""))
			.andExpect(jsonPath("$.dataSourceId").isEmpty())
			.andExpect(jsonPath("$.dataSourceName").value("-"))
			.andReturn()
			.getResponse()
			.getContentAsString();

		long templateId = new com.fasterxml.jackson.databind.ObjectMapper().readTree(createResponse).get("id").asLong();

		ReportTemplate savedTemplate = reportTemplateRepository.findById(templateId).orElseThrow();
		org.assertj.core.api.Assertions.assertThat(savedTemplate.getTemplateCode()).isEqualTo("OPTIONAL001");
		org.assertj.core.api.Assertions.assertThat(savedTemplate.getDescription()).isEmpty();
		org.assertj.core.api.Assertions.assertThat(savedTemplate.getDataSourceConfig()).isNull();

		mockMvc.perform(post("/api/report-templates/preview")
				.with(csrf())
				.contentType(MediaType.APPLICATION_JSON)
				.accept(MediaType.APPLICATION_PDF)
				.content("""
					{
					  "templateId": %d,
					  "parameters": {
					    "start_date": "2026-03-25"
					  }
					}
					""".formatted(templateId)))
			.andExpect(status().isOk())
			.andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Content-Type", org.hamcrest.Matchers.containsString(MediaType.APPLICATION_PDF_VALUE)));
	}

	@Test
	@WithMockUser(username = "admin")
	void reportTemplatesShouldRenderTemplatesWithoutAssignedDataSource() throws Exception {
		java.nio.file.Files.createDirectories(TEST_UPLOADS_DIR);
		java.nio.file.Files.createDirectories(TEST_GENERATED_DIR);
		java.nio.file.Path storedJrxml = TEST_UPLOADS_DIR.resolve("orphan-template.jrxml");
		java.nio.file.Path storedJasper = TEST_GENERATED_DIR.resolve("orphan-template.jasper");
		java.nio.file.Files.writeString(storedJrxml, "<jrxml/>");
		java.nio.file.Files.write(storedJasper, new byte[] { 1, 2, 3 });

		ReportTemplate reportTemplate = new ReportTemplate();
		reportTemplate.setTemplateCode("ORPHAN001");
		reportTemplate.setTemplateName("Orphan Template");
		reportTemplate.setDescription("");
		reportTemplate.setOriginalFileName("orphan-template.jrxml");
		reportTemplate.setJrxmlStoragePath(storedJrxml.toAbsolutePath().toString());
		reportTemplate.setJasperStoragePath(storedJasper.toAbsolutePath().toString());
		reportTemplate.setParameterSchemaJson("[]");
		reportTemplateRepository.save(reportTemplate);

		mockMvc.perform(get("/report-templates"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Orphan Template")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString(">-<")));
	}

	@Test
	@WithMockUser(username = "admin")
	void updateReportTemplateApiShouldPersistChangesAndWriteAuditLog() throws Exception {
		DataSourceConfig dataSourceConfig = createSavedDataSource("Primary");
		ReportTemplate reportTemplate = createSavedReportTemplate(dataSourceConfig, "Initial Template");

		mockMvc.perform(put("/api/report-templates/{id}", reportTemplate.getId())
				.with(csrf())
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "templateCode": "UPDATEDTEMPLATE",
					  "templateName": "Updated Template",
					  "description": "Updated template description",
					  "dataSourceId": %d
					}
					""".formatted(dataSourceConfig.getId())))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.templateCode").value("UPDATEDTEMPLATE"))
			.andExpect(jsonPath("$.templateName").value("Updated Template"));

		ReportTemplate updatedTemplate = reportTemplateRepository.findById(reportTemplate.getId()).orElseThrow();
		org.assertj.core.api.Assertions.assertThat(updatedTemplate.getTemplateCode()).isEqualTo("UPDATEDTEMPLATE");
		org.assertj.core.api.Assertions.assertThat(updatedTemplate.getTemplateCode()).matches("[A-Z0-9]+");
		org.assertj.core.api.Assertions.assertThat(updatedTemplate.getTemplateName()).isEqualTo("Updated Template");
		assertAuditLogRecorded("Report Template Updated", "Updated Template", "Updated template Updated Template", "Completed");
	}

	@Test
	@WithMockUser(username = "admin")
	void reportTemplateApiShouldRejectTemplateCodesWithCharactersOutsideUppercaseLettersAndNumbers() throws Exception {
		MockMultipartFile jrxml = new MockMultipartFile(
			"file",
			"invalid-code-template.jrxml",
			MediaType.TEXT_XML_VALUE,
			minimalJrxml().getBytes(java.nio.charset.StandardCharsets.UTF_8)
		);

		String uploadResponse = mockMvc.perform(multipart("/api/report-templates/upload")
				.file(jrxml)
				.with(csrf()))
			.andExpect(status().isOk())
			.andReturn()
			.getResponse()
			.getContentAsString();

		String uploadToken = new com.fasterxml.jackson.databind.ObjectMapper().readTree(uploadResponse).get("uploadToken").asText();

		mockMvc.perform(post("/api/report-templates")
				.with(csrf())
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "templateCode": "BAD_CODE",
					  "templateName": "Invalid Code Template",
					  "uploadToken": "%s"
					}
					""".formatted(uploadToken)))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.message").value("Template Code must contain uppercase letters and numbers only."));
	}

	@Test
	@WithMockUser(username = "admin")
	void reportTemplateApiShouldRejectDuplicateTemplateCodesWhenCreating() throws Exception {
		createSavedReportTemplate(null, "Duplicate Source Template", "DUPLICATE001");

		MockMultipartFile jrxml = new MockMultipartFile(
			"file",
			"duplicate-template.jrxml",
			MediaType.TEXT_XML_VALUE,
			minimalJrxml().getBytes(java.nio.charset.StandardCharsets.UTF_8)
		);

		String uploadResponse = mockMvc.perform(multipart("/api/report-templates/upload")
				.file(jrxml)
				.with(csrf()))
			.andExpect(status().isOk())
			.andReturn()
			.getResponse()
			.getContentAsString();

		String uploadToken = new com.fasterxml.jackson.databind.ObjectMapper().readTree(uploadResponse).get("uploadToken").asText();

		mockMvc.perform(post("/api/report-templates")
				.with(csrf())
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "templateCode": "duplicate001",
					  "templateName": "Duplicate Code Template",
					  "uploadToken": "%s"
					}
					""".formatted(uploadToken)))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.message").value("Template Code is already in use."));
	}

	@Test
	@WithMockUser(username = "admin")
	void updateReportTemplateApiShouldRejectDuplicateTemplateCodeOwnedByAnotherTemplate() throws Exception {
		ReportTemplate firstTemplate = createSavedReportTemplate(null, "First Template", "DUPLICATE002");
		ReportTemplate secondTemplate = createSavedReportTemplate(null, "Second Template", "SECOND002");

		mockMvc.perform(put("/api/report-templates/{id}", secondTemplate.getId())
				.with(csrf())
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "templateCode": "duplicate002",
					  "templateName": "Second Template",
					  "description": "Second Template description"
					}
					"""))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.message").value("Template Code is already in use."));

		org.assertj.core.api.Assertions.assertThat(reportTemplateRepository.findById(secondTemplate.getId()).orElseThrow().getTemplateCode())
			.isEqualTo("SECOND002");
		org.assertj.core.api.Assertions.assertThat(reportTemplateRepository.findById(firstTemplate.getId()).orElseThrow().getTemplateCode())
			.isEqualTo("DUPLICATE002");
	}

	@Test
	@WithMockUser(username = "admin")
	void reportTemplateApiShouldAllowMultipleBlankTemplateCodes() throws Exception {
		MockMultipartFile firstJrxml = new MockMultipartFile(
			"file",
			"blank-code-1.jrxml",
			MediaType.TEXT_XML_VALUE,
			minimalJrxml().getBytes(java.nio.charset.StandardCharsets.UTF_8)
		);
		MockMultipartFile secondJrxml = new MockMultipartFile(
			"file",
			"blank-code-2.jrxml",
			MediaType.TEXT_XML_VALUE,
			minimalJrxml().getBytes(java.nio.charset.StandardCharsets.UTF_8)
		);

		String firstUploadToken = new com.fasterxml.jackson.databind.ObjectMapper()
			.readTree(mockMvc.perform(multipart("/api/report-templates/upload")
					.file(firstJrxml)
					.with(csrf()))
				.andExpect(status().isOk())
				.andReturn()
				.getResponse()
				.getContentAsString())
			.get("uploadToken")
			.asText();

		String secondUploadToken = new com.fasterxml.jackson.databind.ObjectMapper()
			.readTree(mockMvc.perform(multipart("/api/report-templates/upload")
					.file(secondJrxml)
					.with(csrf()))
				.andExpect(status().isOk())
				.andReturn()
				.getResponse()
				.getContentAsString())
			.get("uploadToken")
			.asText();

		mockMvc.perform(post("/api/report-templates")
				.with(csrf())
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "templateCode": "",
					  "templateName": "Blank Code Template 1",
					  "uploadToken": "%s"
					}
					""".formatted(firstUploadToken)))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.templateCode").value(""));

		mockMvc.perform(post("/api/report-templates")
				.with(csrf())
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "templateCode": "",
					  "templateName": "Blank Code Template 2",
					  "uploadToken": "%s"
					}
					""".formatted(secondUploadToken)))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.templateCode").value(""));
	}

	@Test
	void generateReportApiShouldRequireAccessToken() throws Exception {
		mockMvc.perform(post("/api/reports/generate")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "reportId": 1,
					  "parameters": {
					    "start_date": "2026-03-25"
					  }
					}
					"""))
			.andExpect(status().isUnauthorized())
			.andExpect(jsonPath("$.message").value("Access token is required."));
	}

	@Test
	void generateReportApiShouldRequireReportIdOrTemplateCode() throws Exception {
		AccessToken accessToken = createSavedAccessToken("Missing Template API", "Active");
		accessToken.setTokenValue("public_missing_template_token");
		accessTokenRepository.save(accessToken);

		mockMvc.perform(post("/api/reports/generate")
				.header("X-Access-Token", "public_missing_template_token")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "parameters": {
					    "start_date": "2026-03-25"
					  }
					}
					"""))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.message").value("Report id or template code is required."));
	}

	@Test
	void generateReportApiShouldRejectRevokedAccessToken() throws Exception {
		DataSourceConfig dataSourceConfig = createSavedDataSource("Primary");
		ReportTemplate template = createSavedReportTemplate(dataSourceConfig, "Revoked Template");
		AccessToken accessToken = createSavedAccessToken("Revoked API", "Revoked");
		accessToken.setTokenValue("rpt_revoked_token");
		accessTokenRepository.save(accessToken);

		mockMvc.perform(post("/api/reports/generate")
				.header("X-Access-Token", "rpt_revoked_token")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "reportId": %d,
					  "parameters": {
					    "start_date": "2026-03-25"
					  }
					}
					""".formatted(template.getId())))
			.andExpect(status().isUnauthorized());
	}

	@Test
	void downloadReportApiShouldRequireAccessToken() throws Exception {
		mockMvc.perform(get("/api/reports/files/{id}/download", 999L))
			.andExpect(status().isUnauthorized())
			.andExpect(jsonPath("$.message").value("Access token is required."));
	}

	@Test
	void generateAndDownloadReportApisShouldRequireAccessTokenForDownload() throws Exception {
		DataSourceConfig dataSourceConfig = createSavedDataSource("Primary");
		ReportTemplate template = createSavedReportTemplate(dataSourceConfig, "A4Report");
		AccessToken accessToken = createSavedAccessToken("Reports API", "Active");
		accessToken.setTokenValue("rpt_active_report_token");
		accessToken = accessTokenRepository.save(accessToken);

		String responseBody = mockMvc.perform(post("/api/reports/generate")
				.header("X-Access-Token", "rpt_active_report_token")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "reportId": %d,
					  "format": "pdf",
					  "parameters": {
					    "start_date": "2026-03-25"
					  }
					}
					""".formatted(template.getId())))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.reportFileId").isNumber())
			.andExpect(jsonPath("$.reportId").value(template.getId()))
			.andExpect(jsonPath("$.fileName").value(org.hamcrest.Matchers.startsWith("A4Report-")))
			.andExpect(jsonPath("$.downloadUrl").value(org.hamcrest.Matchers.containsString("/api/reports/files/")))
			.andReturn()
			.getResponse()
			.getContentAsString();

		long generatedReportId = new com.fasterxml.jackson.databind.ObjectMapper().readTree(responseBody).get("reportFileId").asLong();
		GeneratedReportFile generatedReportFile = generatedReportFileRepository.findById(generatedReportId).orElseThrow();
		org.assertj.core.api.Assertions.assertThat(java.nio.file.Path.of(generatedReportFile.getStoragePath())).exists();
		org.assertj.core.api.Assertions.assertThat(generatedReportFile.getGeneratedByTokenId()).isEqualTo(accessToken.getId());

		mockMvc.perform(get("/api/reports/files/{id}/download", generatedReportId)
				.header("X-Access-Token", "rpt_active_report_token"))
			.andExpect(status().isOk())
			.andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Content-Disposition", org.hamcrest.Matchers.containsString("A4Report-")))
			.andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Content-Type", org.hamcrest.Matchers.containsString(MediaType.APPLICATION_PDF_VALUE)));

		GeneratedReportFile downloadedReport = generatedReportFileRepository.findById(generatedReportId).orElseThrow();
		org.assertj.core.api.Assertions.assertThat(downloadedReport.getDownloadCount()).isEqualTo(1);
		org.assertj.core.api.Assertions.assertThat(reportDownloadLogRepository.findAll()).hasSize(1);
		org.assertj.core.api.Assertions.assertThat(reportDownloadLogRepository.findAll().getFirst().getDownloadedByAccessTokenId()).isEqualTo(accessToken.getId());
		org.assertj.core.api.Assertions.assertThat(reportDownloadLogRepository.findAll().getFirst().getDownloadedBy()).isEqualTo("Reports API");
		assertAuditLogRecorded("Report Generated", "A4Report", "Generated file " + generatedReportFile.getDownloadFileName(), "Completed");
		assertAuditLogDetailContains("Report Generated", "A4Report", "Completed", "\"start_date\":\"2026-03-25\"");
		assertAuditLogRecorded("Report Downloaded", "A4Report", "Downloaded file " + generatedReportFile.getDownloadFileName(), "Completed");
	}

	@Test
	@WithMockUser(username = "admin")
	void previewReportShouldAuditRealFailureMessageAndParameters() throws Exception {
		ReportTemplate template = createSavedQueryReportTemplate(null, "PreviewFailureReport", "PREVIEWFAIL01");

		mockMvc.perform(post("/api/report-templates/preview")
				.with(csrf())
				.contentType(MediaType.APPLICATION_JSON)
				.accept(MediaType.APPLICATION_PDF)
				.content("""
					{
					  "templateId": %d,
					  "parameters": {
					    "region": "north"
					  }
					}
					""".formatted(template.getId())))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Select a data source before generating a report that runs a database query.")));

		assertAuditLogRecorded("Report Previewed", "PreviewFailureReport", "Failed to generate preview. Parameters: ", "Failed");
		assertAuditLogDetailContains("Report Previewed", "PreviewFailureReport", "Failed", "\"region\":\"north\"");
		assertAuditLogDetailContains("Report Previewed", "PreviewFailureReport", "Failed", "Select a data source before generating a report that runs a database query.");
	}

	@Test
	void generateReportShouldAuditRealFailureMessageAndParameters() throws Exception {
		createSavedQueryReportTemplate(null, "GenerateFailureReport", "GENERATEFAIL01");
		AccessToken accessToken = createSavedAccessToken("Failure Audit API", "Active");
		accessToken.setTokenValue("generate_failure_audit_token");
		accessTokenRepository.save(accessToken);

		mockMvc.perform(post("/api/reports/generate")
				.header("X-Access-Token", "generate_failure_audit_token")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "templateCode": "GENERATEFAIL01",
					  "format": "pdf",
					  "parameters": {
					    "region": "north"
					  }
					}
					"""))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Select a data source before generating a report that runs a database query.")));

		assertAuditLogRecorded("Report Generated", "GENERATEFAIL01", "Failed to generate report. Parameters: ", "Failed");
		assertAuditLogDetailContains("Report Generated", "GENERATEFAIL01", "Failed", "\"region\":\"north\"");
		assertAuditLogDetailContains("Report Generated", "GENERATEFAIL01", "Failed", "Select a data source before generating a report that runs a database query.");
	}

	@Test
	void generateReportApiShouldUseCurrentRequestContextForDownloadUrlWhenBaseUrlIsNotConfigured() throws Exception {
		DataSourceConfig dataSourceConfig = createSavedDataSource("Primary");
		ReportTemplate template = createSavedReportTemplate(dataSourceConfig, "FallbackDomainReport");
		AccessToken accessToken = createSavedAccessToken("Fallback Domain API", "Active");
		accessToken.setTokenValue("fallback_domain_report_token");
		accessTokenRepository.save(accessToken);

		mockMvc.perform(post("/api/reports/generate")
				.with(request -> {
					request.setScheme("https");
					request.setSecure(true);
					request.setServerPort(443);
					return request;
				})
				.header("Host", "fallback-report-service.example.com")
				.header("X-Access-Token", "fallback_domain_report_token")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "reportId": %d,
					  "format": "pdf",
					  "parameters": {
					    "start_date": "2026-03-25"
					  }
					}
					""".formatted(template.getId())))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.downloadUrl").value(org.hamcrest.Matchers.startsWith("https://fallback-report-service.example.com/api/reports/files/")));
	}

	@Test
	void generateReportApiShouldUseDownloadBaseUrlFromSystemSettings() throws Exception {
		systemSettingsService.updateSettings(new SystemSettingsService.SettingsSaveRequest(true, "Monthly", "05:00", "Asia/Bangkok", "https://report-service.domain.com/"));
		DataSourceConfig dataSourceConfig = createSavedDataSource("Primary");
		ReportTemplate template = createSavedReportTemplate(dataSourceConfig, "ConfiguredDomainReport");
		AccessToken accessToken = createSavedAccessToken("Configured Domain API", "Active");
		accessToken.setTokenValue("configured_domain_report_token");
		accessTokenRepository.save(accessToken);

		mockMvc.perform(post("/api/reports/generate")
				.header("Host", "ignored-by-setting.example.com")
				.header("X-Access-Token", "configured_domain_report_token")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "reportId": %d,
					  "format": "pdf",
					  "parameters": {
					    "start_date": "2026-03-25"
					  }
					}
					""".formatted(template.getId())))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.downloadUrl").value(org.hamcrest.Matchers.startsWith("https://report-service.domain.com/api/reports/files/")));
	}

	@Test
	void generateReportApiShouldAllowTemplateCodeInsteadOfReportId() throws Exception {
		DataSourceConfig dataSourceConfig = createSavedDataSource("Primary");
		ReportTemplate template = createSavedReportTemplate(dataSourceConfig, "CodeLookupReport", "CODEREPORT001");
		AccessToken accessToken = createSavedAccessToken("Code Lookup API", "Active");
		accessToken.setTokenValue("public_code_lookup_token");
		accessToken = accessTokenRepository.save(accessToken);

		String responseBody = mockMvc.perform(post("/api/reports/generate")
				.header("X-Access-Token", "public_code_lookup_token")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "templateCode": "codereport001",
					  "format": "pdf",
					  "parameters": {
					    "start_date": "2026-03-25"
					  }
					}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.reportId").value(template.getId()))
			.andExpect(jsonPath("$.reportTemplateName").value("CodeLookupReport"))
			.andExpect(jsonPath("$.fileName").value(org.hamcrest.Matchers.startsWith("CodeLookupReport-")))
			.andReturn()
			.getResponse()
			.getContentAsString();

		long generatedReportId = new com.fasterxml.jackson.databind.ObjectMapper().readTree(responseBody).get("reportFileId").asLong();
		GeneratedReportFile generatedReportFile = generatedReportFileRepository.findById(generatedReportId).orElseThrow();
		org.assertj.core.api.Assertions.assertThat(generatedReportFile.getReportTemplateId()).isEqualTo(template.getId());
		org.assertj.core.api.Assertions.assertThat(generatedReportFile.getGeneratedByTokenId()).isEqualTo(accessToken.getId());
	}

	@Test
	void executeTemplateShouldCloseJdbcConnectionAfterJasperFill() throws Exception {
		TrackingPostgresDriver trackingDriver = new TrackingPostgresDriver();
		java.util.List<java.sql.Driver> removedDrivers = replaceRegisteredDrivers("org.postgresql.", trackingDriver);

		try {
			DataSourceConfig dataSourceConfig = createTrackedPostgresDataSource("Tracked Query Source");
			ReportTemplate template = createSavedQueryReportTemplate(dataSourceConfig, "TrackedQueryReport", "TRACKQUERY01");

			ReportTemplateService.ExecutedTemplate executedTemplate = reportTemplateService.executeTemplate(template.getId(), java.util.Map.of());

			org.assertj.core.api.Assertions.assertThat(executedTemplate.jasperPrint()).isNotNull();
			org.assertj.core.api.Assertions.assertThat(executedTemplate.jasperPrint().getPages()).isNotEmpty();
			org.assertj.core.api.Assertions.assertThat(trackingDriver.connectCount()).isEqualTo(1);
			org.assertj.core.api.Assertions.assertThat(trackingDriver.closeCount()).isEqualTo(1);
		} finally {
			restoreRegisteredDrivers(trackingDriver, removedDrivers);
		}
	}

	@Test
	void previewShouldCloseJdbcConnectionAfterJasperFill() throws Exception {
		TrackingPostgresDriver trackingDriver = new TrackingPostgresDriver();
		java.util.List<java.sql.Driver> removedDrivers = replaceRegisteredDrivers("org.postgresql.", trackingDriver);

		try {
			DataSourceConfig dataSourceConfig = createTrackedPostgresDataSource("Tracked Preview Source");
			ReportTemplate template = createSavedQueryReportTemplate(dataSourceConfig, "TrackedPreviewReport", "TRACKPREVIEW1");

			byte[] previewPdf = reportTemplateService.preview(new ReportTemplateService.ReportTemplatePreviewRequest(
				template.getId(),
				null,
				null,
				java.util.Map.of()
			));

			org.assertj.core.api.Assertions.assertThat(previewPdf).isNotEmpty();
			org.assertj.core.api.Assertions.assertThat(new String(previewPdf, 0, 4, java.nio.charset.StandardCharsets.US_ASCII)).isEqualTo("%PDF");
			org.assertj.core.api.Assertions.assertThat(trackingDriver.connectCount()).isEqualTo(1);
			org.assertj.core.api.Assertions.assertThat(trackingDriver.closeCount()).isEqualTo(1);
		} finally {
			restoreRegisteredDrivers(trackingDriver, removedDrivers);
		}
	}

	@Test
	@WithMockUser(username = "admin")
	void webReportDownloadShouldUseSessionUser() throws Exception {
		DataSourceConfig dataSourceConfig = createSavedDataSource("Primary");
		ReportTemplate template = createSavedReportTemplate(dataSourceConfig, "WebDownloadReport");
		java.nio.file.Files.createDirectories(TEST_REPORTS_DIR);
		java.nio.file.Path storedReport = TEST_REPORTS_DIR.resolve("WebDownloadReport-20260330-120000.pdf");
		java.nio.file.Files.write(storedReport, new byte[] { 1, 2, 3, 4 });
		GeneratedReportFile generatedReportFile = createGeneratedReportFile(template, storedReport.getFileName().toString(), "pdf", "reports-api");

		mockMvc.perform(get("/reports/files/{id}/download", generatedReportFile.getId()))
			.andExpect(status().isOk())
			.andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Content-Disposition", org.hamcrest.Matchers.containsString("WebDownloadReport-")));

		org.assertj.core.api.Assertions.assertThat(reportDownloadLogRepository.findAll()).hasSize(1);
		org.assertj.core.api.Assertions.assertThat(reportDownloadLogRepository.findAll().getFirst().getDownloadedByAccessTokenId()).isNull();
		org.assertj.core.api.Assertions.assertThat(reportDownloadLogRepository.findAll().getFirst().getDownloadedBy()).isEqualTo("admin");
	}

	@Test
	@WithMockUser(username = "admin")
	void reportTemplateGenerateApiShouldUseSessionUserAndReturnWebDownloadUrl() throws Exception {
		DataSourceConfig dataSourceConfig = createSavedDataSource("Primary");
		ReportTemplate template = createSavedReportTemplate(dataSourceConfig, "AdminGenerateReport");

		String responseBody = mockMvc.perform(post("/api/report-templates/{id}/generate", template.getId())
				.with(csrf())
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "format": "pdf",
					  "parameters": {
					    "start_date": "2026-03-25"
					  }
					}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.reportFileId").isNumber())
			.andExpect(jsonPath("$.reportId").value(template.getId()))
			.andExpect(jsonPath("$.fileName").value(org.hamcrest.Matchers.startsWith("AdminGenerateReport-")))
			.andExpect(jsonPath("$.downloadUrl").value(org.hamcrest.Matchers.containsString("/reports/files/")))
			.andReturn()
			.getResponse()
			.getContentAsString();

		long generatedReportId = new com.fasterxml.jackson.databind.ObjectMapper().readTree(responseBody).get("reportFileId").asLong();
		GeneratedReportFile generatedReportFile = generatedReportFileRepository.findById(generatedReportId).orElseThrow();
		org.assertj.core.api.Assertions.assertThat(java.nio.file.Path.of(generatedReportFile.getStoragePath())).exists();
		org.assertj.core.api.Assertions.assertThat(generatedReportFile.getGeneratedByTokenId()).isNull();
		org.assertj.core.api.Assertions.assertThat(generatedReportFile.getGeneratedByTokenName()).isEqualTo("admin");

		mockMvc.perform(get("/reports/files/{id}/download", generatedReportId))
			.andExpect(status().isOk())
			.andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Content-Disposition", org.hamcrest.Matchers.containsString("AdminGenerateReport-")))
			.andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Content-Type", org.hamcrest.Matchers.containsString(MediaType.APPLICATION_PDF_VALUE)));

		org.assertj.core.api.Assertions.assertThat(reportDownloadLogRepository.findAll()).hasSize(1);
		org.assertj.core.api.Assertions.assertThat(reportDownloadLogRepository.findAll().getFirst().getDownloadedByAccessTokenId()).isNull();
		org.assertj.core.api.Assertions.assertThat(reportDownloadLogRepository.findAll().getFirst().getDownloadedBy()).isEqualTo("admin");
		assertAuditLogRecorded("Report Generated", "AdminGenerateReport", "Generated file " + generatedReportFile.getDownloadFileName(), "Completed");
		assertAuditLogRecorded("Report Downloaded", "AdminGenerateReport", "Downloaded file " + generatedReportFile.getDownloadFileName(), "Completed");
	}

	@Test
	@WithMockUser(username = "admin")
	void reportTemplateGenerateApiShouldSupportDocxFormatForSessionUsers() throws Exception {
		DataSourceConfig dataSourceConfig = createSavedDataSource("Primary");
		ReportTemplate template = createSavedReportTemplate(dataSourceConfig, "AdminDocxReport");

		String responseBody = mockMvc.perform(post("/api/report-templates/{id}/generate", template.getId())
				.with(csrf())
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "format": "docx",
					  "parameters": {
					    "start_date": "2026-03-25"
					  }
					}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.format").value("docx"))
			.andExpect(jsonPath("$.fileName").value(org.hamcrest.Matchers.endsWith(".docx")))
			.andReturn()
			.getResponse()
			.getContentAsString();

		long generatedReportId = new com.fasterxml.jackson.databind.ObjectMapper().readTree(responseBody).get("reportFileId").asLong();

		mockMvc.perform(get("/reports/files/{id}/download", generatedReportId))
			.andExpect(status().isOk())
			.andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Content-Disposition", org.hamcrest.Matchers.containsString(".docx")))
			.andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Content-Type", org.hamcrest.Matchers.containsString("application/vnd.openxmlformats-officedocument.wordprocessingml.document")));
	}

	@Test
	@WithMockUser(username = "admin")
	void reportTemplateGenerateApiShouldSupportXlsxFormatForSessionUsers() throws Exception {
		DataSourceConfig dataSourceConfig = createSavedDataSource("Primary");
		ReportTemplate template = createSavedReportTemplate(dataSourceConfig, "AdminXlsxReport");

		String responseBody = mockMvc.perform(post("/api/report-templates/{id}/generate", template.getId())
				.with(csrf())
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "format": "xlsx",
					  "parameters": {
					    "start_date": "2026-03-25"
					  }
					}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.format").value("xlsx"))
			.andExpect(jsonPath("$.fileName").value(org.hamcrest.Matchers.endsWith(".xlsx")))
			.andReturn()
			.getResponse()
			.getContentAsString();

		long generatedReportId = new com.fasterxml.jackson.databind.ObjectMapper().readTree(responseBody).get("reportFileId").asLong();

		byte[] downloadedContent = mockMvc.perform(get("/reports/files/{id}/download", generatedReportId))
			.andExpect(status().isOk())
			.andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Content-Disposition", org.hamcrest.Matchers.containsString(".xlsx")))
			.andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Content-Type", org.hamcrest.Matchers.containsString("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")))
			.andReturn()
			.getResponse()
			.getContentAsByteArray();

		org.assertj.core.api.Assertions.assertThat(downloadedContent).startsWith("PK".getBytes(java.nio.charset.StandardCharsets.US_ASCII));
	}

	@Test
	void downloadReportApiShouldReturnCorsHeadersForCrossOriginRequests() throws Exception {
		DataSourceConfig dataSourceConfig = createSavedDataSource("Primary");
		ReportTemplate template = createSavedReportTemplate(dataSourceConfig, "CorsReport");
		AccessToken accessToken = createSavedAccessToken("Reports API", "Active");
		accessToken.setTokenValue("rpt_cors_report_token");
		accessToken = accessTokenRepository.save(accessToken);

		String responseBody = mockMvc.perform(post("/api/reports/generate")
				.header("X-Access-Token", "rpt_cors_report_token")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "reportId": %d,
					  "format": "pdf",
					  "parameters": {
					    "start_date": "2026-03-25"
					  }
					}
					""".formatted(template.getId())))
			.andExpect(status().isOk())
			.andReturn()
			.getResponse()
			.getContentAsString();

		long generatedReportId = new com.fasterxml.jackson.databind.ObjectMapper().readTree(responseBody).get("reportFileId").asLong();

		mockMvc.perform(get("/api/reports/files/{id}/download", generatedReportId)
				.header("X-Access-Token", "rpt_cors_report_token")
				.header("Origin", "https://app.example.com"))
			.andExpect(status().isOk())
			.andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Access-Control-Allow-Origin", "https://app.example.com"))
			.andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Access-Control-Expose-Headers", org.hamcrest.Matchers.containsString("Content-Disposition")));
	}

	@Test
	void generateReportApiShouldReturnCorsHeadersForCrossOriginRequests() throws Exception {
		DataSourceConfig dataSourceConfig = createSavedDataSource("Primary");
		ReportTemplate template = createSavedReportTemplate(dataSourceConfig, "CorsGenerateReport");
		AccessToken accessToken = createSavedAccessToken("Reports API", "Active");
		accessToken.setTokenValue("rpt_cors_generate_token");
		accessTokenRepository.save(accessToken);

		mockMvc.perform(post("/api/reports/generate")
				.header("Origin", "https://app.example.com")
				.header("X-Access-Token", "rpt_cors_generate_token")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "reportId": %d,
					  "format": "pdf",
					  "parameters": {
					    "start_date": "2026-03-25"
					  }
					}
					""".formatted(template.getId())))
			.andExpect(status().isOk())
			.andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Access-Control-Allow-Origin", "https://app.example.com"));
	}

	@Test
	@WithMockUser(username = "admin")
	void accessTokenShouldRenderForAuthenticatedUser() throws Exception {
		mockMvc.perform(get("/access-tokens"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Access Tokens")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("access-tokens.js")));
	}

	@Test
	@WithMockUser(username = "admin")
	void accessTokensShouldRenderPersistedRows() throws Exception {
		AccessToken token = createSavedAccessToken("Warehouse Automation", "Active");

		mockMvc.perform(get("/access-tokens"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("<th>ID</th>")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Warehouse Automation")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString(">" + token.getId() + "</td>")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("/access-tokens/edit/" + token.getId())))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("revoke-access-token-modal")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("delete-access-token-modal")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("data-dialog-kind=\"revoke\"")));
	}

	@Test
	@WithMockUser(username = "admin")
	void accessTokensShouldDisableRevokeButtonForRevokedRows() throws Exception {
		createSavedAccessToken("Already Revoked", "Revoked");

		mockMvc.perform(get("/access-tokens"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("aria-label=\"Revoke Already Revoked\"")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("disabled=\"disabled\"")));
	}

	@Test
	@WithMockUser(username = "admin")
	void accessTokensShouldRenderRealPagination() throws Exception {
		for (int index = 1; index <= 12; index++) {
			createSavedAccessToken("Token " + index, index <= 5 ? "Active" : "Suspended");
		}

		mockMvc.perform(get("/access-tokens").param("page", "1").param("size", "5"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Showing 6-10 of 12 access tokens")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString(">2<")));
	}

	@Test
	@WithMockUser(username = "admin")
	void accessTokenEditPageShouldRenderDialogHooks() throws Exception {
		mockMvc.perform(get("/access-tokens/edit"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("toast.js")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("token-feedback-alert")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("save-access-token-modal")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("unsaved-access-token-modal")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("generate-access-token-modal")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("register-access-token-modal")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("manual-token-value")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Register Token")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("revoke-access-token-modal")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Update token metadata, set lifecycle controls, and manage credential actions.")));
	}

	@Test
	@WithMockUser(username = "admin")
	void accessTokenEditScriptShouldIncludeLeaveFlowBeforeUnloadGuard() throws Exception {
		mockMvc.perform(get("/js/access-token-edit.js"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("window.AppToast?.create")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Complete the required fields before saving the access token.")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("register-token")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("manual-token-value")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Enter a token value before registering it.")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("/register")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("field.classList.toggle('is-invalid', invalid)")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("suppressBeforeUnload")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("window.location.assign(href)")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("if (suppressBeforeUnload || !isDirty())")));
	}

	@Test
	@WithMockUser(username = "admin")
	void existingAccessTokenEditPageShouldRenderWithIdMeta() throws Exception {
		AccessToken token = createSavedAccessToken("Partner API", "Active");

		mockMvc.perform(get("/access-tokens/edit/{id}", token.getId()))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("meta name=\"access_token_id\" content=\"" + token.getId() + "\"")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Edit Access Token")));
	}

	@Test
	@WithMockUser(username = "admin")
	void missingAccessTokenEditPageShouldReturnNotFound() throws Exception {
		mockMvc.perform(get("/access-tokens/edit/{id}", 9999L))
			.andExpect(status().isNotFound());
	}

	@Test
	@WithMockUser(username = "admin")
	void createAccessTokenApiShouldPersistAndReturnId() throws Exception {
		mockMvc.perform(post("/api/access-tokens")
				.with(csrf())
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "tokenName": "Reporting Automation",
					  "description": "Used by nightly reporting jobs",
					  "expiryPolicy": "60 days",
					  "status": "Active"
					}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.id").isNumber())
			.andExpect(jsonPath("$.tokenName").value("Reporting Automation"))
			.andExpect(jsonPath("$.maskedApiKey").value("Not generated"))
			.andExpect(jsonPath("$.tokenValue").isEmpty())
			.andExpect(jsonPath("$.tokenGenerated").value(false));

		org.assertj.core.api.Assertions.assertThat(accessTokenRepository.findAll()).hasSize(1);
		assertAuditLogRecorded("Access Token Created", "Reporting Automation", "Created access token Reporting Automation", "Completed");
	}

	@Test
	@WithMockUser(username = "admin")
	void updateAccessTokenApiShouldUpdateExistingRecord() throws Exception {
		AccessToken token = createSavedAccessToken("Initial Token", "Suspended");

		mockMvc.perform(put("/api/access-tokens/{id}", token.getId())
				.with(csrf())
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "tokenName": "Updated Token",
					  "description": "Updated description",
					  "expiryPolicy": "90 days",
					  "status": "Active"
					}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.id").value(token.getId()))
			.andExpect(jsonPath("$.tokenName").value("Updated Token"))
			.andExpect(jsonPath("$.status").value("Active"));

		AccessToken updated = accessTokenRepository.findById(token.getId()).orElseThrow();
		org.assertj.core.api.Assertions.assertThat(updated.getTokenName()).isEqualTo("Updated Token");
		org.assertj.core.api.Assertions.assertThat(updated.getExpiryPolicy()).isEqualTo("90 days");
		assertAuditLogRecorded("Access Token Updated", "Updated Token", "Updated access token Updated Token", "Completed");
	}

	@Test
	@WithMockUser(username = "admin")
	void generateAccessTokenApiShouldPersistTokenValue() throws Exception {
		AccessToken token = createSavedAccessToken("Generate Me", "Active");

		mockMvc.perform(post("/api/access-tokens/{id}/generate", token.getId()).with(csrf()))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.plainToken").value(org.hamcrest.Matchers.not(org.hamcrest.Matchers.startsWith("rpt_"))))
			.andExpect(jsonPath("$.token.tokenValue").value(org.hamcrest.Matchers.not(org.hamcrest.Matchers.startsWith("rpt_"))))
			.andExpect(jsonPath("$.token.tokenGenerated").value(true))
			.andExpect(jsonPath("$.maskedApiKey").value(org.hamcrest.Matchers.containsString("••••")));

		AccessToken updated = accessTokenRepository.findById(token.getId()).orElseThrow();
		org.assertj.core.api.Assertions.assertThat(updated.getTokenValue()).doesNotStartWith("rpt_");
		org.assertj.core.api.Assertions.assertThat(updated.getStatus()).isEqualTo("Active");
		assertAuditLogRecorded("Access Token Updated", "Generate Me", "Generated token value for Generate Me", "Completed");
	}

	@Test
	@WithMockUser(username = "admin")
	void registerAccessTokenApiShouldPersistManualTokenValue() throws Exception {
		AccessToken token = createSavedAccessToken("Register Me", "Suspended");

		mockMvc.perform(post("/api/access-tokens/{id}/register", token.getId())
				.with(csrf())
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "tokenValue": "custom_report_token_001"
					}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.tokenValue").value("custom_report_token_001"))
			.andExpect(jsonPath("$.tokenGenerated").value(true))
			.andExpect(jsonPath("$.status").value("Active"));

		AccessToken updated = accessTokenRepository.findById(token.getId()).orElseThrow();
		org.assertj.core.api.Assertions.assertThat(updated.getTokenValue()).isEqualTo("custom_report_token_001");
		org.assertj.core.api.Assertions.assertThat(updated.getStatus()).isEqualTo("Active");
		assertAuditLogRecorded("Access Token Updated", "Register Me", "Registered token value for Register Me", "Completed");
	}

	@Test
	@WithMockUser(username = "admin")
	void registerAccessTokenApiShouldRejectDuplicateManualTokenValue() throws Exception {
		AccessToken existingToken = createSavedAccessToken("Existing Token", "Active");
		existingToken.setTokenValue("shared_manual_token");
		accessTokenRepository.save(existingToken);
		AccessToken token = createSavedAccessToken("Duplicate Register", "Suspended");

		mockMvc.perform(post("/api/access-tokens/{id}/register", token.getId())
				.with(csrf())
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "tokenValue": "shared_manual_token"
					}
					"""))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.message").value("Token value is already in use."));
	}

	@Test
	@WithMockUser(username = "admin")
	void revokeAccessTokenApiShouldPersistRevokedStatus() throws Exception {
		AccessToken token = createSavedAccessToken("Revoke Me", "Active");
		token.setTokenValue("rpt_existing_secret");
		token = accessTokenRepository.save(token);

		mockMvc.perform(post("/api/access-tokens/{id}/revoke", token.getId()).with(csrf()))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.status").value("Revoked"));

		AccessToken updated = accessTokenRepository.findById(token.getId()).orElseThrow();
		org.assertj.core.api.Assertions.assertThat(updated.getStatus()).isEqualTo("Revoked");
		org.assertj.core.api.Assertions.assertThat(updated.getRevokedAt()).isNotNull();
		assertAuditLogRecorded("Access Token Updated", "Revoke Me", "Revoked access token Revoke Me", "Completed");
	}

	@Test
	@WithMockUser(username = "admin")
	void revokeAccessTokenPageActionShouldRedirectAndPersistStatus() throws Exception {
		AccessToken token = createSavedAccessToken("List Revoke", "Active");

		mockMvc.perform(post("/access-tokens/revoke/{id}", token.getId()).with(csrf()))
			.andExpect(status().is3xxRedirection())
			.andExpect(redirectedUrl("/access-tokens?page=0&size=10"));

		AccessToken updated = accessTokenRepository.findById(token.getId()).orElseThrow();
		org.assertj.core.api.Assertions.assertThat(updated.getStatus()).isEqualTo("Revoked");
	}

	@Test
	@WithMockUser(username = "admin")
	void deleteAccessTokenPageActionShouldRedirectAndRemoveRecord() throws Exception {
		AccessToken token = createSavedAccessToken("List Delete", "Active");

		mockMvc.perform(post("/access-tokens/delete/{id}", token.getId()).with(csrf()))
			.andExpect(status().is3xxRedirection())
			.andExpect(redirectedUrl("/access-tokens?page=0&size=10"));

		org.assertj.core.api.Assertions.assertThat(accessTokenRepository.existsById(token.getId())).isFalse();
	}

	@Test
	@WithMockUser(username = "admin")
	void deleteAccessTokenApiShouldReturnNoContent() throws Exception {
		AccessToken token = createSavedAccessToken("API Delete", "Active");

		mockMvc.perform(delete("/api/access-tokens/{id}", token.getId()).with(csrf()))
			.andExpect(status().isNoContent());

		org.assertj.core.api.Assertions.assertThat(accessTokenRepository.existsById(token.getId())).isFalse();
		assertAuditLogRecorded("Access Token Deleted", "API Delete", "Deleted access token API Delete", "Completed");
	}


	@Test
	@WithMockUser(username = "admin")
	void dataSourcesShouldRenderForAuthenticatedUser() throws Exception {
		mockMvc.perform(get("/data-sources"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Data Sources")));
	}

	@Test
	@WithMockUser(username = "admin")
	void dataSourcesShouldRenderPersistedRows() throws Exception {
		DataSourceConfig config = new DataSourceConfig();
		config.setDatabaseName("reporting");
		config.setConnectionLabel("Primary");
		config.setDatabaseType(DataSourceType.POSTGRESQL);
		config.setHostAddress("127.0.0.1");
		config.setPort(5432);
		config.setUsername("report_user");
		config.setPassword("secret");
		config.setLastTestStatus("Connected");
		dataSourceConfigRepository.save(config);

		mockMvc.perform(get("/data-sources"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("<th>ID</th>")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("<th>Database Name</th>")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Primary")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString(">127.0.0.1</p>")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString(">reporting</td>")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString(">" + config.getId() + "</td>")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("/data-sources/edit/" + config.getId())))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("delete-data-source-modal")))
			.andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("Search name, host, username, or type"))));
	}

	@Test
	@WithMockUser(username = "admin")
	void dataSourcesShouldRenderRealPagination() throws Exception {
		for (int index = 1; index <= 12; index++) {
			DataSourceConfig config = new DataSourceConfig();
			config.setDatabaseName("db-" + index);
			config.setConnectionLabel("Source " + index);
			config.setDatabaseType(DataSourceType.POSTGRESQL);
			config.setHostAddress("127.0.0." + index);
			config.setPort(5432);
			config.setUsername("user" + index);
			config.setPassword("secret");
			dataSourceConfigRepository.save(config);
		}

		mockMvc.perform(get("/data-sources").param("page", "2").param("size", "5"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Showing 11-12 of 12 result(s)")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString(">3<")));
	}

	@Test
	@WithMockUser(username = "admin")
	void createDataSourceApiShouldPersistAndReturnId() throws Exception {
		mockMvc.perform(post("/api/data-sources")
				.with(csrf())
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "databaseName": "reporting",
					  "connectionLabel": "Primary",
					  "databaseType": "postgresql",
					  "hostAddress": "127.0.0.1",
					  "port": 5432,
					  "connectTimeoutSeconds": 10,
					  "socketTimeoutSeconds": 30,
					  "username": "report_user",
					  "password": "secret"
					}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.id").isNumber())
			.andExpect(jsonPath("$.connectionLabel").value("Primary"))
			.andExpect(jsonPath("$.connectTimeoutSeconds").value(10))
			.andExpect(jsonPath("$.socketTimeoutSeconds").value(30))
			.andExpect(jsonPath("$.password").doesNotExist())
			.andExpect(jsonPath("$.passwordConfigured").value(true));

		org.assertj.core.api.Assertions.assertThat(dataSourceConfigRepository.findAll()).hasSize(1);
		DataSourceConfig saved = dataSourceConfigRepository.findAll().getFirst();
		org.assertj.core.api.Assertions.assertThat(saved.getConnectTimeoutSeconds()).isEqualTo(10);
		org.assertj.core.api.Assertions.assertThat(saved.getSocketTimeoutSeconds()).isEqualTo(30);
		assertAuditLogRecorded("Data Source Created", "Primary", "Created data source Primary", "Completed");
	}

	@Test
	@WithMockUser(username = "admin")
	void createOracleDataSourceApiShouldPersistAndReturnId() throws Exception {
		mockMvc.perform(post("/api/data-sources")
				.with(csrf())
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "databaseName": "reporting",
					  "connectionLabel": "Oracle Primary",
					  "databaseType": "oracle",
					  "hostAddress": "127.0.0.1",
					  "port": 1521,
					  "connectTimeoutSeconds": 10,
					  "socketTimeoutSeconds": 30,
					  "username": "report_user",
					  "password": "secret"
					}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.id").isNumber())
			.andExpect(jsonPath("$.databaseType").value("oracle"));

		org.assertj.core.api.Assertions.assertThat(dataSourceConfigRepository.findAll()).hasSize(1);
		DataSourceConfig saved = dataSourceConfigRepository.findAll().getFirst();
		org.assertj.core.api.Assertions.assertThat(saved.getDatabaseType()).isEqualTo(DataSourceType.ORACLE);
	}

	@Test
	@WithMockUser(username = "admin")
	void updateDataSourceApiShouldUpdateExistingRecord() throws Exception {
		DataSourceConfig config = new DataSourceConfig();
		config.setDatabaseName("reporting");
		config.setConnectionLabel("Primary");
		config.setDatabaseType(DataSourceType.POSTGRESQL);
		config.setHostAddress("127.0.0.1");
		config.setPort(5432);
		config.setUsername("report_user");
		config.setPassword("secret");
		config = dataSourceConfigRepository.save(config);

		mockMvc.perform(put("/api/data-sources/{id}", config.getId())
				.with(csrf())
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "databaseName": "warehouse",
					  "connectionLabel": "Warehouse Link",
					  "databaseType": "mysql",
					  "hostAddress": "192.168.1.10",
					  "port": 3306,
					  "connectTimeoutSeconds": 12,
					  "socketTimeoutSeconds": 45,
					  "username": "warehouse_user",
					  "password": ""
					}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.id").value(config.getId()))
			.andExpect(jsonPath("$.databaseName").value("warehouse"))
			.andExpect(jsonPath("$.databaseType").value("mysql"))
			.andExpect(jsonPath("$.connectTimeoutSeconds").value(12))
			.andExpect(jsonPath("$.socketTimeoutSeconds").value(45))
			.andExpect(jsonPath("$.password").doesNotExist())
			.andExpect(jsonPath("$.passwordConfigured").value(true));

		DataSourceConfig updated = dataSourceConfigRepository.findById(config.getId()).orElseThrow();
		org.assertj.core.api.Assertions.assertThat(updated.getConnectionLabel()).isEqualTo("Warehouse Link");
		org.assertj.core.api.Assertions.assertThat(updated.getConnectTimeoutSeconds()).isEqualTo(12);
		org.assertj.core.api.Assertions.assertThat(updated.getSocketTimeoutSeconds()).isEqualTo(45);
		org.assertj.core.api.Assertions.assertThat(updated.getPassword()).isEqualTo("secret");
		assertAuditLogRecorded("Data Source Updated", "Warehouse Link", "Updated data source Warehouse Link", "Completed");
	}

	@Test
	@WithMockUser(username = "admin")
	void getDataSourceApiShouldNotExposePassword() throws Exception {
		DataSourceConfig config = new DataSourceConfig();
		config.setDatabaseName("reporting");
		config.setConnectionLabel("Primary");
		config.setDatabaseType(DataSourceType.POSTGRESQL);
		config.setHostAddress("127.0.0.1");
		config.setPort(5432);
		config.setUsername("report_user");
		config.setPassword("secret");
		config = dataSourceConfigRepository.save(config);

		mockMvc.perform(get("/api/data-sources/{id}", config.getId()))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.connectTimeoutSeconds").value(10))
			.andExpect(jsonPath("$.socketTimeoutSeconds").value(30))
			.andExpect(jsonPath("$.password").doesNotExist())
			.andExpect(jsonPath("$.passwordConfigured").value(true));
	}

	@Test
	@WithMockUser(username = "admin")
	void deleteDataSourcePageActionShouldRemoveRecord() throws Exception {
		DataSourceConfig config = new DataSourceConfig();
		config.setDatabaseName("reporting");
		config.setConnectionLabel("Primary");
		config.setDatabaseType(DataSourceType.POSTGRESQL);
		config.setHostAddress("127.0.0.1");
		config.setPort(5432);
		config.setUsername("report_user");
		config.setPassword("secret");
		config = dataSourceConfigRepository.save(config);

		mockMvc.perform(post("/data-sources/delete/{id}", config.getId()).with(csrf()))
			.andExpect(status().is3xxRedirection())
			.andExpect(redirectedUrl("/data-sources?page=0&size=10"));

		org.assertj.core.api.Assertions.assertThat(dataSourceConfigRepository.existsById(config.getId())).isFalse();
		assertAuditLogRecorded("Data Source Deleted", "Primary", "Deleted data source Primary", "Completed");
	}

	@Test
	@WithMockUser(username = "admin")
	void deleteDataSourceApiShouldReturnNoContent() throws Exception {
		DataSourceConfig config = new DataSourceConfig();
		config.setDatabaseName("reporting");
		config.setConnectionLabel("Primary");
		config.setDatabaseType(DataSourceType.POSTGRESQL);
		config.setHostAddress("127.0.0.1");
		config.setPort(5432);
		config.setUsername("report_user");
		config.setPassword("secret");
		config = dataSourceConfigRepository.save(config);

		mockMvc.perform(delete("/api/data-sources/{id}", config.getId()).with(csrf()))
			.andExpect(status().isNoContent());

		org.assertj.core.api.Assertions.assertThat(dataSourceConfigRepository.existsById(config.getId())).isFalse();
		assertAuditLogRecorded("Data Source Deleted", "Primary", "Deleted data source Primary", "Completed");
	}

	@Test
	@WithMockUser(username = "admin")
	void testConnectionApiShouldUseSavedRecordAndPersistFailureState() throws Exception {
		DataSourceConfig config = new DataSourceConfig();
		config.setDatabaseName("reporting");
		config.setConnectionLabel("Primary");
		config.setDatabaseType(DataSourceType.POSTGRESQL);
		config.setHostAddress("127.0.0.1");
		config.setPort(5432);
		config.setUsername("report_user");
		config.setPassword("secret");
		config = dataSourceConfigRepository.save(config);

		mockMvc.perform(post("/api/data-sources/{id}/test", config.getId()).with(csrf()))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.saveRequired").value(false))
			.andExpect(jsonPath("$.status").value("Failed"));

		DataSourceConfig updated = dataSourceConfigRepository.findById(config.getId()).orElseThrow();
		org.assertj.core.api.Assertions.assertThat(updated.getLastTestStatus()).isEqualTo("Failed");
		org.assertj.core.api.Assertions.assertThat(updated.getLastTestedAt()).isNotNull();
		assertAuditLogRecorded("Data Source Tested", "Primary", "Connection test failed for Primary", "Failed");
	}

	@Test
	@WithMockUser(username = "admin")
	void newDataSourceEditPageShouldRenderDirtyFormHooks() throws Exception {
		mockMvc.perform(get("/data-sources/edit"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("toast.js")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("connection-health-alert")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("data-source-edit.js")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("save-data-source")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("disabled")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("unsaved-changes-modal")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Leave Without Saving")));
	}

	@Test
	@WithMockUser(username = "admin")
	void newDataSourceEditPageShouldRenderDatabaseNameAfterCredentialsRow() throws Exception {
		String page = mockMvc.perform(get("/data-sources/edit"))
			.andExpect(status().isOk())
			.andReturn()
			.getResponse()
			.getContentAsString();

		org.assertj.core.api.Assertions.assertThat(page.indexOf("id=\"db-username\""))
			.isLessThan(page.indexOf("id=\"db-password\""));
		org.assertj.core.api.Assertions.assertThat(page.indexOf("id=\"db-password\""))
			.isLessThan(page.indexOf("id=\"database-name\""));
	}

	@Test
	@WithMockUser(username = "admin")
	void newDataSourceEditPageShouldRenderConnectionLabelAsFullWidthField() throws Exception {
		String page = mockMvc.perform(get("/data-sources/edit"))
			.andExpect(status().isOk())
			.andReturn()
			.getResponse()
			.getContentAsString();

		int connectionLabelIndex = page.indexOf("id=\"connection-label\"");
		org.assertj.core.api.Assertions.assertThat(connectionLabelIndex).isGreaterThanOrEqualTo(0);
		org.assertj.core.api.Assertions.assertThat(page.lastIndexOf("class=\"field-grid\"", connectionLabelIndex)).isEqualTo(-1);
		org.assertj.core.api.Assertions.assertThat(connectionLabelIndex)
			.isLessThan(page.indexOf("class=\"option-grid\""));
	}

	@Test
	@WithMockUser(username = "admin")
	void newDataSourceEditPageShouldRenderTimeoutFieldsWithDefaults() throws Exception {
		mockMvc.perform(get("/data-sources/edit"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("id=\"connect-timeout-seconds\"")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("value=\"10\"")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("id=\"socket-timeout-seconds\"")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("value=\"30\"")));
	}

	@Test
	@WithMockUser(username = "admin")
	void newDataSourceEditPageShouldRenderNumericPortInput() throws Exception {
		mockMvc.perform(get("/data-sources/edit"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("id=\"host-port\"")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("inputmode=\"numeric\"")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("pattern=\"[0-9]*\"")));
	}

	@Test
	@WithMockUser(username = "admin")
	void dataSourceEditScriptShouldIncludeLeaveFlowBeforeUnloadGuard() throws Exception {
		mockMvc.perform(get("/js/data-source-edit.js"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("replace(/\\D/g, '')")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("connectTimeoutSeconds")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("socketTimeoutSeconds")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("window.AppToast?.create")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Complete the required fields before saving the data source.")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("option-grid--invalid")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("group-label--invalid")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("suppressBeforeUnload")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("window.location.assign(href)")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("if (suppressBeforeUnload || !isDirty())")));
	}

	@Test
	@WithMockUser(username = "admin")
	void toastScriptShouldExposeReusableTopRightToastHelper() throws Exception {
		mockMvc.perform(get("/js/toast.js"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("window.AppToast")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("status-alert--toast")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("const create = ({ alertElement, messageElement, duration = DEFAULT_DURATION } = {}) =>")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("queueHide(alertElement, duration, hide)")));
	}

	@Test
	@WithMockUser(username = "admin")
	void existingDataSourceEditPageShouldRenderWithIdMeta() throws Exception {
		DataSourceConfig config = new DataSourceConfig();
		config.setDatabaseName("reporting");
		config.setConnectionLabel("Primary");
		config.setDatabaseType(DataSourceType.POSTGRESQL);
		config.setHostAddress("127.0.0.1");
		config.setPort(5432);
		config.setUsername("report_user");
		config.setPassword("secret");
		config = dataSourceConfigRepository.save(config);

		mockMvc.perform(get("/data-sources/edit/{id}", config.getId()))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("meta name=\"data_source_id\" content=\"" + config.getId() + "\"")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Edit Data Source")));
	}

	@Test
	@WithMockUser(username = "admin")
	void missingDataSourceEditPageShouldReturnNotFound() throws Exception {
		mockMvc.perform(get("/data-sources/edit/{id}", 9999L))
			.andExpect(status().isNotFound());
	}

	@Test
	@WithMockUser(username = "admin")
	void auditLogsShouldRenderForAuthenticatedUser() throws Exception {
		for (int index = 1; index <= 12; index++) {
			AuditLogEvent auditLogEvent = new AuditLogEvent();
			auditLogEvent.setEventName(switch (index % 4) {
				case 0 -> "Report Template Updated";
				case 1 -> "Report Downloaded";
				case 2 -> "Data Source Tested";
				default -> "Access Token Updated";
			});
			auditLogEvent.setEventDetail(switch (index % 4) {
				case 0 -> "Updated template Template " + index;
				case 1 -> "Downloaded file audit-log-" + index + ".pdf";
				case 2 -> "Connection test failed for Source " + index;
				default -> "Revoked access token Token " + index;
			});
			auditLogEvent.setActor(index % 2 == 0 ? "admin" : "Public Download");
			auditLogEvent.setTarget(switch (index % 4) {
				case 2 -> "Source " + index;
				case 3 -> "Token " + index;
				default -> "Template " + index;
			});
			auditLogEvent.setStatus(index % 4 == 2 ? "Failed" : "Completed");
			auditLogEvent.setOccurredAt(java.time.LocalDateTime.now().minusMinutes(index));
			auditLogEventRepository.save(auditLogEvent);
		}

		mockMvc.perform(get("/audit-logs").param("page", "1").param("size", "10"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Audit Logs")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Review system activity, administrative changes, and security-relevant events across the platform.")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Search Logs")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Export Logs")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("search-panel--audit-stacked")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("search-panel__row--primary")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("search-panel__row--dates")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("search-field__clear-all")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Clear All")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("search-panel__filters--primary")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("search-panel__actions--audit-secondary")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("/js/audit-logs.js")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Today")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Last 7 Days")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("This Month")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Date Start")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Date Stop")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("All Categories")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("All Statuses")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("audit-from-date")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("audit-to-date")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("data-audit-date-preset-input")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("data-audit-display-today-input")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString(">Completed<")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString(">Failed<")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString(">XLSX<")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString(">CSV<")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Report Templates")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Data Sources")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Access Tokens")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Reports")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("toolbar-align-end--equal")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Revoked access token Token 11")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Report Template Updated")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("pill pill--info")))
			.andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("Total Events"))))
			.andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("Critical Alerts"))))
			.andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("Retention Window"))))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Showing 11-12 of 12 audit events")));
	}

	@Test
	@WithMockUser(username = "admin")
	void auditLogsShouldClearPresetHighlightWhenCustomDatesAreSubmitted() throws Exception {
		java.time.LocalDate customDate = java.time.LocalDate.of(2026, 4, 5);

		createAuditEvent("Report Generated", "Generated file custom-report.pdf", "reports-api", "Custom Report", "Completed", customDate.atTime(10, 0));

		mockMvc.perform(get("/audit-logs")
				.param("datePreset", "")
				.param("fromDate", customDate.toString())
				.param("toDate", customDate.toString())
				.param("page", "0")
				.param("size", "10"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("ghost-button--active"))))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("custom-report.pdf")));
	}

	@Test
	@WithMockUser(username = "admin")
	void auditLogsShouldHighlightTodayPresetWhenActive() throws Exception {
		java.time.LocalDate today = auditLogService.currentDisplayDate();

		createAuditEvent("Report Generated", "Generated file today-report.pdf", "reports-api", "Today Report", "Completed", today.atTime(10, 0));
		createAuditEvent("Report Downloaded", "Downloaded file older-report.pdf", "Public Download", "Older Report", "Completed", today.minusDays(1).atTime(9, 0));

		mockMvc.perform(get("/audit-logs")
				.param("datePreset", "today")
				.param("fromDate", today.toString())
				.param("toDate", today.toString())
				.param("page", "0")
				.param("size", "10"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("ghost-button--active")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("today-report.pdf")))
			.andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("older-report.pdf"))));
	}

	@Test
	@WithMockUser(username = "admin")
	void auditLogsPaginationShouldPreserveTodayPresetState() throws Exception {
		java.time.LocalDate today = auditLogService.currentDisplayDate();

		for (int index = 1; index <= 12; index++) {
			createAuditEvent(
				"Report Generated",
				"Generated file today-report-" + index + ".pdf",
				"reports-api",
				"Today Report " + index,
				"Completed",
				today.atTime(10, 0).minusMinutes(index)
			);
		}

		mockMvc.perform(get("/audit-logs")
				.param("datePreset", "today")
				.param("fromDate", today.toString())
				.param("toDate", today.toString())
				.param("page", "0")
				.param("size", "10"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("datePreset=today")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("fromDate=" + today)))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("toDate=" + today)))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("page=1")));
	}

	@Test
	@WithMockUser(username = "admin")
	void auditLogsShouldHighlightLast7DaysPresetWhenActive() throws Exception {
		java.time.LocalDate today = auditLogService.currentDisplayDate();
		java.time.LocalDate last7Start = today.minusDays(6);

		createAuditEvent("Report Generated", "Generated file last-7-days.pdf", "reports-api", "Last 7 Days Report", "Completed", today.atTime(10, 0));
		createAuditEvent("Report Downloaded", "Downloaded file older-than-last-7-days.pdf", "Public Download", "Older Report", "Completed", last7Start.minusDays(1).atTime(9, 0));

		mockMvc.perform(get("/audit-logs")
				.param("datePreset", "last-7-days")
				.param("fromDate", last7Start.toString())
				.param("toDate", today.toString())
				.param("page", "0")
				.param("size", "10"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("datePreset=last-7-days")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("ghost-button--active")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("last-7-days.pdf")))
			.andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("older-than-last-7-days.pdf"))));
	}

	@Test
	@WithMockUser(username = "admin")
	void auditLogsShouldHighlightThisMonthPresetWhenActive() throws Exception {
		java.time.LocalDate today = auditLogService.currentDisplayDate();
		java.time.LocalDate monthStart = today.withDayOfMonth(1);

		createAuditEvent("Report Generated", "Generated file this-month.pdf", "reports-api", "This Month Report", "Completed", today.atTime(10, 0));
		createAuditEvent("Report Downloaded", "Downloaded file previous-month.pdf", "Public Download", "Previous Month Report", "Completed", monthStart.minusDays(1).atTime(9, 0));

		mockMvc.perform(get("/audit-logs")
				.param("datePreset", "this-month")
				.param("fromDate", monthStart.toString())
				.param("toDate", today.toString())
				.param("page", "0")
				.param("size", "10"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("datePreset=this-month")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("ghost-button--active")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("this-month.pdf")))
			.andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("previous-month.pdf"))));
	}

	@Test
	@WithMockUser(username = "admin")
	void auditLogsShouldRenderCustomDateStateForSearchAndExportForm() throws Exception {
		java.time.LocalDate fromDate = java.time.LocalDate.of(2026, 4, 3);
		java.time.LocalDate toDate = java.time.LocalDate.of(2026, 4, 5);

		createAuditEvent("Report Generated", "Generated file custom-window.pdf", "reports-api", "Custom Window", "Completed", toDate.atTime(10, 0));

		mockMvc.perform(get("/audit-logs")
				.param("datePreset", "")
				.param("fromDate", fromDate.toString())
				.param("toDate", toDate.toString())
				.param("q", "custom")
				.param("category", "reports")
				.param("status", "Completed")
				.param("format", "csv")
				.param("page", "0")
				.param("size", "10"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("name=\"datePreset\" value=\"\"")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("id=\"audit-from-date\" name=\"fromDate\" type=\"hidden\" value=\"" + fromDate + "\"")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("id=\"audit-to-date\" name=\"toDate\" type=\"hidden\" value=\"" + toDate + "\"")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("formaction=\"/audit-logs/export\"")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("value=\"csv\" selected=\"selected\"")))
			.andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("ghost-button--active"))));
	}

	@Test
	@WithMockUser(username = "admin")
	void auditLogsShouldFilterByCategory() throws Exception {
		createAuditEvent("Report Template Updated", "Updated template Finance Summary", "admin", "Finance Summary", "Completed", java.time.LocalDateTime.now().minusMinutes(1));
		createAuditEvent("Data Source Tested", "Connection test failed for Primary Warehouse", "admin", "Primary Warehouse", "Failed", java.time.LocalDateTime.now().minusMinutes(2));
		createAuditEvent("Access Token Updated", "Generated token value for Partner API", "admin", "Partner API", "Completed", java.time.LocalDateTime.now().minusMinutes(3));
		createAuditEvent("Report Downloaded", "Downloaded file monthly-sales.pdf", "Public Download", "Monthly Sales", "Completed", java.time.LocalDateTime.now().minusMinutes(4));

		mockMvc.perform(get("/audit-logs")
				.param("category", "reports")
				.param("page", "0")
				.param("size", "10"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Report Downloaded")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("monthly-sales.pdf")))
			.andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("Finance Summary"))))
			.andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("Primary Warehouse"))))
			.andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("Partner API"))));
	}

	@Test
	@WithMockUser(username = "admin")
	void auditLogsShouldFilterByDateRange() throws Exception {
		createAuditEvent("Report Generated", "Generated file today-report.pdf", "reports-api", "Today Report", "Completed", java.time.LocalDateTime.of(2026, 3, 27, 10, 0));
		createAuditEvent("Report Downloaded", "Downloaded file older-report.pdf", "Public Download", "Older Report", "Completed", java.time.LocalDateTime.of(2026, 3, 20, 9, 0));

		mockMvc.perform(get("/audit-logs")
				.param("fromDate", "2026-03-25")
				.param("toDate", "2026-03-27")
				.param("page", "0")
				.param("size", "10"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("today-report.pdf")))
			.andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("older-report.pdf"))));
	}

	@Test
	@WithMockUser(username = "admin")
	void auditLogsShouldFilterByStatus() throws Exception {
		createAuditEvent("Report Generated", "Generated file sales-summary.pdf", "reports-api", "Sales Summary", "Completed", java.time.LocalDateTime.now().minusMinutes(1));
		createAuditEvent("Data Source Tested", "Connection test failed for Warehouse Link", "admin", "Warehouse Link", "Failed", java.time.LocalDateTime.now().minusMinutes(2));
		createAuditEvent("Access Token Updated", "Generated token value for Partner API", "admin", "Partner API", "Completed", java.time.LocalDateTime.now().minusMinutes(3));

		mockMvc.perform(get("/audit-logs")
				.param("status", "Failed")
				.param("page", "0")
				.param("size", "10"))
			.andExpect(status().isOk())
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Connection test failed for Warehouse Link")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("pill pill--danger")))
			.andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("sales-summary.pdf"))))
			.andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("Partner API"))));
	}

	@Test
	@WithMockUser(username = "admin")
	void auditLogsExportShouldReturnFilteredCsv() throws Exception {
		createAuditEvent("Report Generated", "Generated file sales-summary.pdf", "reports-api", "Sales Summary", "Completed", java.time.LocalDateTime.of(2026, 3, 20, 10, 0));
		createAuditEvent("Access Token Updated", "Revoked access token Legacy API", "admin", "Legacy API", "Completed", java.time.LocalDateTime.of(2026, 3, 18, 9, 0));

		mockMvc.perform(get("/audit-logs/export")
				.param("category", "reports")
				.param("format", "csv")
				.param("status", "Completed")
				.param("fromDate", "2026-03-01")
				.param("toDate", "2026-03-31")
				.param("q", "sales"))
			.andExpect(status().isOk())
			.andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Content-Disposition", org.hamcrest.Matchers.allOf(
				org.hamcrest.Matchers.containsString("audit-logs-reports-completed-from-20260301-to-20260331-sales"),
				org.hamcrest.Matchers.containsString(".csv")
			)))
			.andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Content-Type", org.hamcrest.Matchers.containsString("text/csv")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("Category,Event,Detail,Actor,Target,Timestamp,Status")))
			.andExpect(content().string(org.hamcrest.Matchers.containsString("\"Reports\",\"Report Generated\",\"Generated file sales-summary.pdf\",\"reports-api\",\"Sales Summary\"")))
			.andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("Legacy API"))));
	}

	@Test
	@WithMockUser(username = "admin")
	void auditLogsExportShouldReturnFilteredXlsx() throws Exception {
		createAuditEvent("Report Generated", "Generated file sales-summary.xlsx", "reports-api", "Sales Summary", "Completed", java.time.LocalDateTime.of(2026, 3, 20, 10, 0));
		createAuditEvent("Data Source Tested", "Connection test failed for Warehouse Link", "admin", "Warehouse Link", "Failed", java.time.LocalDateTime.of(2026, 3, 18, 9, 0));

		var response = mockMvc.perform(get("/audit-logs/export")
				.param("category", "reports")
				.param("format", "xlsx")
				.param("status", "Completed")
				.param("fromDate", "2026-03-01")
				.param("toDate", "2026-03-31")
				.param("q", "sales"))
			.andExpect(status().isOk())
			.andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Content-Disposition", org.hamcrest.Matchers.allOf(
				org.hamcrest.Matchers.containsString("audit-logs-reports-completed-from-20260301-to-20260331-sales"),
				org.hamcrest.Matchers.containsString(".xlsx")
			)))
			.andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Content-Type", org.hamcrest.Matchers.containsString("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")))
			.andReturn()
			.getResponse();

		try (var workbook = org.apache.poi.ss.usermodel.WorkbookFactory.create(new java.io.ByteArrayInputStream(response.getContentAsByteArray()))) {
			var sheet = workbook.getSheetAt(0);
			org.assertj.core.api.Assertions.assertThat(sheet.getSheetName()).isEqualTo("Audit Logs");
			org.assertj.core.api.Assertions.assertThat(sheet.getRow(0).getCell(0).getStringCellValue()).isEqualTo("Category");
			org.assertj.core.api.Assertions.assertThat(sheet.getRow(1).getCell(0).getStringCellValue()).isEqualTo("Reports");
			org.assertj.core.api.Assertions.assertThat(sheet.getRow(1).getCell(1).getStringCellValue()).isEqualTo("Report Generated");
			org.assertj.core.api.Assertions.assertThat(sheet.getRow(1).getCell(2).getStringCellValue()).contains("sales-summary.xlsx");
			org.assertj.core.api.Assertions.assertThat(sheet.getRow(1).getCell(4).getStringCellValue()).isEqualTo("Sales Summary");
			org.assertj.core.api.Assertions.assertThat(sheet.getLastRowNum()).isEqualTo(1);
		}
	}

	private DataSourceConfig createSavedDataSource(String connectionLabel) {
		DataSourceConfig config = new DataSourceConfig();
		config.setDatabaseName("reporting");
		config.setConnectionLabel(connectionLabel);
		config.setDatabaseType(DataSourceType.POSTGRESQL);
		config.setHostAddress("127.0.0.1");
		config.setPort(5432);
		config.setUsername("report_user");
		config.setPassword("secret");
		return dataSourceConfigRepository.save(config);
	}

	private DataSourceConfig createTrackedPostgresDataSource(String connectionLabel) {
		DataSourceConfig config = new DataSourceConfig();
		config.setDatabaseName(TrackingPostgresDriver.TEST_DATABASE);
		config.setConnectionLabel(connectionLabel);
		config.setDatabaseType(DataSourceType.POSTGRESQL);
		config.setHostAddress(TrackingPostgresDriver.TEST_HOST);
		config.setPort(TrackingPostgresDriver.TEST_PORT);
		config.setUsername("tracked_user");
		config.setPassword("tracked_password");
		return dataSourceConfigRepository.save(config);
	}

	private AccessToken createSavedAccessToken(String tokenName, String status) {
		AccessToken token = new AccessToken();
		token.setTokenName(tokenName);
		token.setDescription("Access token for " + tokenName);
		token.setExpiryPolicy("30 days");
		token.setStatus(status);
		token.setErrorRate("--");
		return accessTokenRepository.save(token);
	}

	private ReportTemplate createSavedReportTemplate(DataSourceConfig dataSourceConfig, String templateName) throws Exception {
		return createSavedReportTemplate(dataSourceConfig, templateName, templateName.toUpperCase(java.util.Locale.ROOT).replaceAll("[^A-Z0-9]+", ""));
	}

	private ReportTemplate createSavedReportTemplate(DataSourceConfig dataSourceConfig, String templateName, String templateCode) throws Exception {
		return createSavedReportTemplate(
			dataSourceConfig,
			templateName,
			templateCode,
			minimalJrxml(),
			"[{\"name\":\"start_date\",\"label\":\"Start Date\",\"valueClassName\":\"java.lang.String\",\"inputType\":\"text\",\"required\":false}]"
		);
	}

	private ReportTemplate createSavedQueryReportTemplate(DataSourceConfig dataSourceConfig, String templateName, String templateCode) throws Exception {
		return createSavedReportTemplate(dataSourceConfig, templateName, templateCode, queryJrxml("SELECT MESSAGE FROM REPORT_ROWS"), "[]");
	}

	private ReportTemplate createSavedReportTemplate(
		DataSourceConfig dataSourceConfig,
		String templateName,
		String templateCode,
		String jrxmlContent,
		String parameterSchemaJson
	) throws Exception {
		java.nio.file.Files.createDirectories(TEST_UPLOADS_DIR);
		java.nio.file.Files.createDirectories(TEST_GENERATED_DIR);
		java.nio.file.Path storedJrxml = TEST_UPLOADS_DIR.resolve(templateName + ".jrxml");
		java.nio.file.Path storedJasper = TEST_GENERATED_DIR.resolve(templateName + ".jasper");
		java.nio.file.Files.writeString(storedJrxml, jrxmlContent);

		net.sf.jasperreports.engine.JasperReport jasperReport = net.sf.jasperreports.engine.JasperCompileManager.compileReport(storedJrxml.toString());
		try (java.io.ObjectOutputStream objectOutputStream = new java.io.ObjectOutputStream(java.nio.file.Files.newOutputStream(storedJasper))) {
			objectOutputStream.writeObject(jasperReport);
		}

		ReportTemplate reportTemplate = new ReportTemplate();
		reportTemplate.setTemplateCode(templateCode);
		reportTemplate.setTemplateName(templateName);
		reportTemplate.setDescription(templateName + " description");
		reportTemplate.setDataSourceConfig(dataSourceConfig);
		reportTemplate.setOriginalFileName(templateName + ".jrxml");
		reportTemplate.setJrxmlStoragePath(storedJrxml.toAbsolutePath().toString());
		reportTemplate.setJasperStoragePath(storedJasper.toAbsolutePath().toString());
		reportTemplate.setParameterSchemaJson(parameterSchemaJson);
		return reportTemplateRepository.save(reportTemplate);
	}

	private GeneratedReportFile createGeneratedReportFile(ReportTemplate reportTemplate, String fileName, String format, String generatedByTokenName) {
		GeneratedReportFile generatedReportFile = new GeneratedReportFile();
		generatedReportFile.setReportTemplateId(reportTemplate.getId());
		generatedReportFile.setReportTemplateName(reportTemplate.getTemplateName());
		generatedReportFile.setOutputFormat(format);
		generatedReportFile.setDownloadFileName(fileName);
		generatedReportFile.setStoragePath(TEST_REPORTS_DIR.resolve(fileName).toAbsolutePath().toString());
		generatedReportFile.setParametersJson("{}");
		generatedReportFile.setFileSizeBytes(1234L);
		generatedReportFile.setGeneratedByTokenId(1L);
		generatedReportFile.setGeneratedByTokenName(generatedByTokenName);
		generatedReportFile.setGeneratedAt(java.time.LocalDateTime.now().minusMinutes(1));
		generatedReportFile.setDownloadCount(0);
		return generatedReportFileRepository.save(generatedReportFile);
	}

	private void createAuditEvent(String eventName, String eventDetail, String actor, String target, String status, java.time.LocalDateTime occurredAt) {
		AuditLogEvent auditLogEvent = new AuditLogEvent();
		auditLogEvent.setEventName(eventName);
		auditLogEvent.setEventDetail(eventDetail);
		auditLogEvent.setActor(actor);
		auditLogEvent.setTarget(target);
		auditLogEvent.setStatus(status);
		auditLogEvent.setOccurredAt(occurredAt);
		auditLogEventRepository.save(auditLogEvent);
	}

	private void assertAuditLogRecorded(String eventName, String target, String detailPrefix, String status) {
		org.assertj.core.api.Assertions.assertThat(
			auditLogEventRepository.findAll().stream().anyMatch(event ->
				eventName.equals(event.getEventName())
					&& target.equals(event.getTarget())
					&& status.equals(event.getStatus())
					&& event.getEventDetail() != null
					&& event.getEventDetail().startsWith(detailPrefix)
			)
		).isTrue();
	}

		private void assertAuditLogDetailContains(String eventName, String target, String status, String detailFragment) {
			org.assertj.core.api.Assertions.assertThat(
				auditLogEventRepository.findAll().stream().anyMatch(event ->
					eventName.equals(event.getEventName())
						&& target.equals(event.getTarget())
						&& status.equals(event.getStatus())
						&& event.getEventDetail() != null
						&& event.getEventDetail().contains(detailFragment)
				)
			).isTrue();
		}

	private String minimalJrxml() throws net.sf.jasperreports.engine.JRException {
		net.sf.jasperreports.engine.design.JasperDesign jasperDesign = new net.sf.jasperreports.engine.design.JasperDesign();
		jasperDesign.setName("sample_report");
		jasperDesign.setPageWidth(595);
		jasperDesign.setPageHeight(842);
		jasperDesign.setColumnWidth(555);
		jasperDesign.setLeftMargin(20);
		jasperDesign.setRightMargin(20);
		jasperDesign.setTopMargin(20);
		jasperDesign.setBottomMargin(20);

		net.sf.jasperreports.engine.design.JRDesignParameter parameter = new net.sf.jasperreports.engine.design.JRDesignParameter();
		parameter.setName("start_date");
		parameter.setValueClass(java.lang.String.class);
		parameter.setForPrompting(true);
		jasperDesign.addParameter(parameter);

		net.sf.jasperreports.engine.design.JRDesignQuery query = new net.sf.jasperreports.engine.design.JRDesignQuery();
		query.setText("");
		jasperDesign.setQuery(query);

		net.sf.jasperreports.engine.design.JRDesignBand band = new net.sf.jasperreports.engine.design.JRDesignBand();
		band.setHeight(40);

		net.sf.jasperreports.engine.design.JRDesignTextField textField = new net.sf.jasperreports.engine.design.JRDesignTextField();
		textField.setX(0);
		textField.setY(0);
		textField.setWidth(555);
		textField.setHeight(20);
		net.sf.jasperreports.engine.design.JRDesignExpression expression = new net.sf.jasperreports.engine.design.JRDesignExpression();
		expression.setText("$P{start_date} == null ? \"No date\" : $P{start_date}");
		textField.setExpression(expression);
		band.addElement(textField);

		((net.sf.jasperreports.engine.design.JRDesignSection) jasperDesign.getDetailSection()).addBand(band);
		return net.sf.jasperreports.engine.xml.JRXmlWriter.writeReport(jasperDesign, "UTF-8");
	}

	private String queryJrxml(String queryText) throws net.sf.jasperreports.engine.JRException {
		net.sf.jasperreports.engine.design.JasperDesign jasperDesign = new net.sf.jasperreports.engine.design.JasperDesign();
		jasperDesign.setName("query_report");
		jasperDesign.setPageWidth(595);
		jasperDesign.setPageHeight(842);
		jasperDesign.setColumnWidth(555);
		jasperDesign.setLeftMargin(20);
		jasperDesign.setRightMargin(20);
		jasperDesign.setTopMargin(20);
		jasperDesign.setBottomMargin(20);

		net.sf.jasperreports.engine.design.JRDesignQuery query = new net.sf.jasperreports.engine.design.JRDesignQuery();
		query.setText(queryText);
		jasperDesign.setQuery(query);

		net.sf.jasperreports.engine.design.JRDesignField messageField = new net.sf.jasperreports.engine.design.JRDesignField();
		messageField.setName("MESSAGE");
		messageField.setValueClass(java.lang.String.class);
		jasperDesign.addField(messageField);

		net.sf.jasperreports.engine.design.JRDesignBand band = new net.sf.jasperreports.engine.design.JRDesignBand();
		band.setHeight(40);

		net.sf.jasperreports.engine.design.JRDesignTextField textField = new net.sf.jasperreports.engine.design.JRDesignTextField();
		textField.setX(0);
		textField.setY(0);
		textField.setWidth(555);
		textField.setHeight(20);
		net.sf.jasperreports.engine.design.JRDesignExpression expression = new net.sf.jasperreports.engine.design.JRDesignExpression();
		expression.setText("$F{MESSAGE}");
		textField.setExpression(expression);
		band.addElement(textField);

		((net.sf.jasperreports.engine.design.JRDesignSection) jasperDesign.getDetailSection()).addBand(band);
		return net.sf.jasperreports.engine.xml.JRXmlWriter.writeReport(jasperDesign, "UTF-8");
	}

	private java.util.List<java.sql.Driver> replaceRegisteredDrivers(String classNamePrefix, java.sql.Driver replacementDriver) throws java.sql.SQLException {
		java.util.List<java.sql.Driver> removedDrivers = java.util.Collections.list(java.sql.DriverManager.getDrivers()).stream()
			.filter(driver -> driver.getClass().getName().startsWith(classNamePrefix))
			.collect(java.util.stream.Collectors.toCollection(java.util.ArrayList::new));

		for (java.sql.Driver driver : removedDrivers) {
			java.sql.DriverManager.deregisterDriver(driver);
		}

		java.sql.DriverManager.registerDriver(replacementDriver);
		return removedDrivers;
	}

	private void restoreRegisteredDrivers(java.sql.Driver replacementDriver, java.util.List<java.sql.Driver> removedDrivers) throws java.sql.SQLException {
		java.sql.DriverManager.deregisterDriver(replacementDriver);

		for (java.sql.Driver driver : removedDrivers) {
			java.sql.DriverManager.registerDriver(driver);
		}
	}

	private void deleteDirectory(java.nio.file.Path directory) {
		if (!java.nio.file.Files.exists(directory)) {
			return;
		}

		try (java.util.stream.Stream<java.nio.file.Path> stream = java.nio.file.Files.walk(directory)) {
			stream.sorted(java.util.Comparator.reverseOrder())
				.forEach(path -> {
					try {
						java.nio.file.Files.deleteIfExists(path);
					} catch (java.io.IOException exception) {
						throw new RuntimeException(exception);
					}
				});
		} catch (java.io.IOException exception) {
			throw new RuntimeException(exception);
		}
	}

	private static final class TrackingPostgresDriver implements java.sql.Driver {
		private static final String TEST_HOST = "tracked-host";
		private static final int TEST_PORT = 15432;
		private static final String TEST_DATABASE = "tracking_close_test";
		private static final String TEST_URL = "jdbc:postgresql://" + TEST_HOST + ":" + TEST_PORT + "/" + TEST_DATABASE;
		private static final String H2_URL = "jdbc:h2:mem:jasper-close-check;MODE=PostgreSQL;DB_CLOSE_DELAY=-1";

		private final java.util.concurrent.atomic.AtomicInteger connectCount = new java.util.concurrent.atomic.AtomicInteger();
		private final java.util.concurrent.atomic.AtomicInteger closeCount = new java.util.concurrent.atomic.AtomicInteger();

		@Override
		public java.sql.Connection connect(String url, java.util.Properties info) throws java.sql.SQLException {
			if (!acceptsURL(url)) {
				return null;
			}

			connectCount.incrementAndGet();
			java.sql.Connection delegate = java.sql.DriverManager.getConnection(H2_URL, "sa", "");

			try (java.sql.Statement statement = delegate.createStatement()) {
				statement.execute("CREATE TABLE IF NOT EXISTS REPORT_ROWS (MESSAGE VARCHAR(255))");
				statement.execute("DELETE FROM REPORT_ROWS");
				statement.execute("INSERT INTO REPORT_ROWS (MESSAGE) VALUES ('tracked-close')");
			}

			return (java.sql.Connection) java.lang.reflect.Proxy.newProxyInstance(
				TrackingPostgresDriver.class.getClassLoader(),
				new Class<?>[] { java.sql.Connection.class },
				(proxy, method, args) -> invokeConnectionMethod(proxy, delegate, method, args)
			);
		}

		private Object invokeConnectionMethod(Object proxy, java.sql.Connection delegate, java.lang.reflect.Method method, Object[] args) throws Throwable {
			if ("close".equals(method.getName())) {
				closeCount.incrementAndGet();
			}

			if ("unwrap".equals(method.getName())) {
				Class<?> type = (Class<?>) args[0];
				if (type.isInstance(proxy)) {
					return proxy;
				}
			}

			if ("isWrapperFor".equals(method.getName())) {
				Class<?> type = (Class<?>) args[0];
				if (type.isInstance(proxy)) {
					return true;
				}
			}

			try {
				return method.invoke(delegate, args);
			} catch (java.lang.reflect.InvocationTargetException exception) {
				throw exception.getTargetException();
			}
		}

		@Override
		public boolean acceptsURL(String url) {
			return TEST_URL.equals(url);
		}

		@Override
		public java.sql.DriverPropertyInfo[] getPropertyInfo(String url, java.util.Properties info) {
			return new java.sql.DriverPropertyInfo[0];
		}

		@Override
		public int getMajorVersion() {
			return 1;
		}

		@Override
		public int getMinorVersion() {
			return 0;
		}

		@Override
		public boolean jdbcCompliant() {
			return false;
		}

		@Override
		public java.util.logging.Logger getParentLogger() throws java.sql.SQLFeatureNotSupportedException {
			throw new java.sql.SQLFeatureNotSupportedException();
		}

		private int connectCount() {
			return connectCount.get();
		}

		private int closeCount() {
			return closeCount.get();
		}
	}

}
