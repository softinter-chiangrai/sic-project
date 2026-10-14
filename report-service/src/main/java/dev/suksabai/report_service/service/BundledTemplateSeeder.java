package dev.suksabai.report_service.service;

import dev.suksabai.report_service.repository.DataSourceConfigRepository;
import dev.suksabai.report_service.service.ReportTemplateService.ReportTemplateSaveRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;

import java.util.Locale;

/**
 * Loads the SIC report templates bundled in classpath:report-templates/*.jrxml (they need no Java helper, only the SQL functions of the
 * SIC database migration V20261014090000) so the SIC backend finds them by code (pm_requirement_report = PMREQUIREMENTREPORT).
 * Opt-in: report.bundled-templates.seed=true. Templates that already exist are never touched.
 * They run SQL against the SIC database: set report.bundled-templates.data-source-id, or leave it empty when exactly one data source exists.
 */
@Component
@ConditionalOnProperty(name = "report.bundled-templates.seed", havingValue = "true")
public class BundledTemplateSeeder implements ApplicationRunner {
	private static final Logger logger = LoggerFactory.getLogger(BundledTemplateSeeder.class);

	private final ReportTemplateService templates;
	private final DataSourceConfigRepository dataSources;
	private final Long configuredDataSourceId;

	public BundledTemplateSeeder(
		ReportTemplateService templates,
		DataSourceConfigRepository dataSources,
		@Value("${report.bundled-templates.data-source-id:}") String dataSourceId
	) {
		this.templates = templates;
		this.dataSources = dataSources;
		this.configuredDataSourceId = dataSourceId == null || dataSourceId.isBlank() ? null : Long.valueOf(dataSourceId.trim());
	}

	@Override
	public void run(ApplicationArguments args) throws Exception {
		Long dataSourceId = configuredDataSourceId;
		if (dataSourceId == null && dataSources.count() == 1) {
			dataSourceId = dataSources.findAll().get(0).getId();
		}
		if (dataSourceId == null) {
			logger.warn("Bundled templates are seeded without a data source (set report.bundled-templates.data-source-id); they cannot run SQL until one is chosen.");
		}

		for (Resource resource : new PathMatchingResourcePatternResolver().getResources("classpath:report-templates/*.jrxml")) {
			String fileName = resource.getFilename();
			String baseName = fileName.substring(0, fileName.length() - ".jrxml".length());
			String code = baseName.replace("_", "").toUpperCase(Locale.ROOT);
			if (templates.existsByCode(code)) {
				continue;
			}
			try {
				var upload = templates.uploadJrxml(fileName, resource.getContentAsByteArray());
				templates.create(new ReportTemplateSaveRequest(code, baseName, "Bundled SIC template (no Java helper)", dataSourceId, upload.uploadToken()));
				logger.info("Seeded report template {} from {}", code, fileName);
			} catch (RuntimeException exception) {
				logger.error("Could not seed report template {}: {}", code, exception.getMessage());
			}
		}
	}
}
