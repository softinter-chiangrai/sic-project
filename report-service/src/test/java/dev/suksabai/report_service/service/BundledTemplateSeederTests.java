package dev.suksabai.report_service.service;

import dev.suksabai.report_service.repository.ReportTemplateRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
	"report.bundled-templates.seed=true",
	"file.reports-uploads-dir=target/seed-uploads",
	"file.reports-generated-dir=target/seed-generated"
})
class BundledTemplateSeederTests {

	@Autowired
	private ReportTemplateRepository repository;

	@Autowired
	private ReportTemplateService service;

	@Test
	void everyBundledTemplateCompilesAndIsSeededUnderTheCodeTheSicBackendSends() {
		assertEquals(12, repository.count());
		for (String code : new String[] {
			"pm_requirement_report", "pm_specification_report", "pm_change_request_report", "pm_contract_report", "pm_delivery_report", "pm_invoice_report",
			"pm_ticket_report", "pm_user_manual_report", "pm_design_review_report", "pm_uat_report", "pm_project_report", "pm_diagram_report"
		}) {
			assertTrue(service.existsByCode(code), code);
		}
	}

	@Test
	void aSeededTemplateGeneratesWithoutAnyJavaHelper() {
		// the diagram report has no SQL, so it runs without a data source
		var executed = service.executeTemplateByCode("pm_diagram_report", Map.of("lang", "th", "diagramName", "ER", "diagramCode", "D-1"));
		assertNotNull(executed.jasperPrint());
		assertTrue(executed.jasperPrint().getPages().size() >= 1);
	}
}
