package com.softinter.sicapi.util;

import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperReport;
import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class ProjectReportTemplateTest {

    private static final String PATH = "/reports/project_report.jrxml";

    @Test
    void template_compiles() throws Exception {
        try (InputStream in = getClass().getResourceAsStream(PATH)) {
            assertNotNull(in);
            JasperReport report = JasperCompileManager.compileReport(in);
            assertEquals("ProjectReport", report.getName());
        }
    }

    @Test
    void template_hasNoBigProjectReportTitle() throws Exception {
        try (InputStream in = getClass().getResourceAsStream(PATH)) {
            assertNotNull(in);
            String xml = new String(in.readAllBytes(), StandardCharsets.UTF_8);
            assertFalse(xml.contains("รายงานข้อมูลโครงการ (Project Report)"));
        }
    }
}
