package dev.suksabai.report_service.service;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

class ReportTemplateServiceTests {

	private final ReportTemplateService service = new ReportTemplateService(null, null, null, null, "target/test-uploads", "target/test-generated");

	@Test
	void inputTypeForMarksCollectionParametersAsMultivalue() {
		assertEquals("multivalue", service.inputTypeFor("java.util.ArrayList"));
	}

	@Test
	void toParameterValuesParsesDelimitedCollectionStrings() {
		List<ReportTemplateService.ParameterDefinition> definitions = List.of(
			new ReportTemplateService.ParameterDefinition("p_order_id", "p_order_id", "java.util.ArrayList", "multivalue", false)
		);

		Map<String, Object> values = service.toParameterValues(definitions, Map.of("p_order_id", "1001, 1002\n1003"));

		assertEquals(List.of("1001", "1002", "1003"), values.get("p_order_id"));
		assertInstanceOf(java.util.ArrayList.class, values.get("p_order_id"));
	}

	@Test
	void toParameterValuesKeepsJsonArrayValuesForCollectionParameters() {
		List<ReportTemplateService.ParameterDefinition> definitions = List.of(
			new ReportTemplateService.ParameterDefinition("p_order_id", "p_order_id", "java.util.ArrayList", "multivalue", false)
		);

		Map<String, Object> values = service.toParameterValues(definitions, Map.of("p_order_id", List.of(1001, 1002, 1003)));

		assertEquals(List.of(1001, 1002, 1003), values.get("p_order_id"));
		assertInstanceOf(java.util.ArrayList.class, values.get("p_order_id"));
	}

	@Test
	void toParameterValuesConvertsNumericScalarValuesFromJsonNumbers() {
		List<ReportTemplateService.ParameterDefinition> definitions = List.of(
			new ReportTemplateService.ParameterDefinition("p_order_detail_id", "p_order_detail_id", "java.lang.Integer", "number", false)
		);

		Map<String, Object> values = service.toParameterValues(definitions, Map.of("p_order_detail_id", 42));

		assertEquals(42, values.get("p_order_detail_id"));
	}
}
