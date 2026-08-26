package dev.suksabai.report_service;

import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.design.JasperDesign;
import net.sf.jasperreports.engine.xml.JRXmlLoader;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class BarcodeReportCompileTests {

	@Test
	void barcodeReportJrxmlCompilesWithBarcode4jComponent() throws Exception {
		byte[] jrxml = Files.readAllBytes(Path.of("error/Barcode_Report.jrxml"));
		JasperDesign design = JRXmlLoader.load(new ByteArrayInputStream(jrxml));
		JasperReport report = JasperCompileManager.compileReport(design);

		assertNotNull(report);
		assertEquals("Barcode_Report", report.getName());
	}
}
