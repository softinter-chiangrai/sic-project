package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.service.PmCustomerProjectExportService;
import com.softinter.sicapi.service.PmDiagramExportService;
import com.softinter.sicapi.service.PmUatExportService;
import com.softinter.sicapi.service.ReportServiceClient;
import com.softinter.sicapi.util.PdfBook;
import com.softinter.sicapi.util.ReportHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

/**
 * The project report is a book: the project summary (project_report.jrxml, part "head"), a table of contents, then every
 * document of the project as its own report exactly as it prints alone (SDLC order), and the sign-off page (part "tail").
 * Page numbers run through the whole book (PdfBook).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PmCustomerProjectExportServiceImpl implements PmCustomerProjectExportService {

    private final DataSource dataSource;
    private final ReportServiceClient reportServiceClient;
    private final DocumentPdfExporters exporters;
    private final PmDiagramExportService diagramExport;
    private final PmUatExportService uatExport;

    private static final DateTimeFormatter DISPLAY_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
                             .withZone(ZoneId.of("Asia/Bangkok"));

    /** One kind of document in the book: heading, the rows (id, label) of the project, and how one of them is exported. */
    private record Chapter(String th, String en, String sql, Exporter export) {
    }

    @FunctionalInterface
    private interface Exporter {
        byte[] export(UUID id, UUID projectId, UUID businessId, String lang) throws Exception;
    }

    private List<Chapter> chapters() {
        return List.of(
                new Chapter("สัญญา", "Contracts",
                        "SELECT id, contract_no FROM pm_customer_contract WHERE project_id = ? AND is_delete = false ORDER BY created_date",
                        (id, p, b, l) -> exporters.export("contract", id, b, l)),
                new Chapter("ความต้องการ (Requirements)", "Requirements",
                        "SELECT id, requirement_code || ' ' || COALESCE(title, '') FROM pm_requirement WHERE project_id = ? AND is_delete = false ORDER BY requirement_code",
                        (id, p, b, l) -> exporters.export("requirement", id, b, l)),
                // all diagrams of the project are one report; the row only needs a count
                new Chapter("แผนภาพ (Diagrams)", "Diagrams",
                        "SELECT ?::uuid, COUNT(*) || ' diagram(s)' FROM pm_diagram WHERE project_id = ?::uuid AND is_delete = false HAVING COUNT(*) > 0",
                        (id, p, b, l) -> diagramExport.exportAllDiagramsPdf(p, null, b, l, null)),
                new Chapter("ข้อกำหนดเชิงเทคนิค (Specifications)", "Specifications",
                        "SELECT id, specification_code || ' ' || COALESCE(title, '') FROM pm_specification WHERE project_id = ? AND is_delete = false ORDER BY specification_code",
                        (id, p, b, l) -> exporters.export("specification", id, b, l)),
                new Chapter("การตรวจทานแบบ (Design Reviews)", "Design Reviews",
                        "SELECT id, COALESCE(review_code, '') || ' ' || COALESCE(title, '') FROM pm_design_review WHERE project_id = ? AND is_delete = false ORDER BY created_date",
                        (id, p, b, l) -> exporters.export("design-review", id, b, l)),
                // every test case of the project is one UAT report
                new Chapter("ผลการทดสอบ (Test / UAT)", "Test Results (UAT)",
                        "SELECT ?::uuid, COUNT(*) || ' test case(s)' FROM pm_test_case WHERE project_id = ?::uuid AND is_delete = false HAVING COUNT(*) > 0",
                        (id, p, b, l) -> uatExport.exportUatReportPdf(p, b, "ALL", null, l)),
                new Chapter("คู่มือการใช้งาน (User Manuals)", "User Manuals",
                        "SELECT id, COALESCE(manual_code, '') || ' ' || COALESCE(manual_title, '') FROM pm_user_manual WHERE project_id = ? AND is_delete = false ORDER BY created_date",
                        (id, p, b, l) -> exporters.export("user-manual", id, b, l)),
                new Chapter("การส่งมอบ (Deliveries)", "Deliveries",
                        "SELECT id, COALESCE(delivery_code, '') || ' ' || COALESCE(delivery_title, '') FROM pm_delivery WHERE project_id = ? AND is_delete = false ORDER BY delivery_date NULLS LAST, created_date",
                        (id, p, b, l) -> exporters.export("delivery", id, b, l)),
                new Chapter("ใบแจ้งหนี้ (Invoices)", "Invoices",
                        "SELECT id, invoice_no FROM pm_invoice WHERE project_id = ? AND is_delete = false ORDER BY COALESCE(issue_date, invoice_date) NULLS LAST, created_date",
                        (id, p, b, l) -> exporters.export("invoice", id, b, l)),
                new Chapter("ตั๋วแจ้งปัญหา MA (MA Tickets)", "MA Tickets",
                        "SELECT id, COALESCE(ticket_no, '') || ' ' || COALESCE(title, '') FROM pm_ma_ticket WHERE project_id = ? AND is_delete = false ORDER BY created_date",
                        (id, p, b, l) -> exporters.export("ma-ticket", id, b, l)),
                new Chapter("คำขอเปลี่ยนแปลง (Change Requests)", "Change Requests",
                        "SELECT id, COALESCE(cr_code, '') || ' ' || COALESCE(title, '') FROM pm_change_request WHERE project_id = ? AND is_delete = false ORDER BY created_date",
                        (id, p, b, l) -> exporters.export("change-request", id, b, l)));
    }

    @Override
    public byte[] exportProjectPdf(UUID id, UUID businessId, String lang) {
        String normalizedLang = (lang != null && lang.equalsIgnoreCase("en")) ? "en" : "th";
        boolean en = "en".equals(normalizedLang);
        log.info("Generating Project book: id={}, businessId={}, lang={}", id, businessId, normalizedLang);
        try {
            // inside the selected-projects book, the outer book numbers the pages
            boolean numberPages = !ReportServiceClient.isBookMode();
            return ReportServiceClient.inBookMode(() -> buildBook(id, businessId, normalizedLang, en, numberPages));
        } catch (Exception e) {
            log.error("Failed to generate Project book for id={}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Error generating Project PDF: " + e.getMessage(), e);
        }
    }

    private byte[] buildBook(UUID id, UUID businessId, String normalizedLang, boolean en, boolean numberPages) throws Exception {
        byte[] head = summaryPdf(id, businessId, normalizedLang, "head");
        List<PdfBook.Entry> entries = new ArrayList<>();
        for (Chapter chapter : chapters()) {
            List<String[]> rows = rows(chapter.sql(), id);
            List<PdfBook.Entry> docs = new ArrayList<>();
            for (String[] row : rows) {
                try {
                    docs.add(new PdfBook.Entry(row[1], false, chapter.export().export(UUID.fromString(row[0]), id, businessId, normalizedLang)));
                } catch (Exception e) {
                    // one document that cannot be exported does not stop the book; it is left out of it
                    log.warn("Project book {}: skipped {} {}: {}", id, chapter.en(), row[1], e.getMessage());
                }
            }
            if (!docs.isEmpty()) {
                entries.add(new PdfBook.Entry(en ? chapter.en() : chapter.th(), true, null));
                entries.addAll(docs);
            }
        }
        byte[] tail = summaryPdf(id, businessId, normalizedLang, "tail");
        String projectName = projectName(id);
        return PdfBook.build(head, entries, tail, en ? "Sign-off & Approvals" : "การลงนามอนุมัติและรับรอง",
                PdfBook.jasperToc(normalizedLang, projectName), normalizedLang, numberPages);
    }

    /** project_report.jrxml: part "head" = the project summary, "tail" = the sign-off page. Report-service first, local Jasper as fallback. */
    private byte[] summaryPdf(UUID id, UUID businessId, String lang, String part) throws Exception {
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("projectId", id != null ? id.toString() : "");
        parameters.put("businessId", businessId != null ? businessId.toString() : "");
        parameters.put("exportDate", DISPLAY_FORMATTER.format(Instant.now()));
        parameters.put("lang", lang);
        parameters.put("part", part);
        parameters.put(JRParameter.REPORT_LOCALE, "en".equals(lang) ? Locale.ENGLISH : new Locale("th", "TH"));

        try {
            return reportServiceClient.generateAndDownloadReport("pm_project_report", parameters, "pdf");
        } catch (Exception e) {
            log.warn("Failed to generate Project PDF ({}) via Report Service: {}. Checking fallback...", part, e.getMessage());
            if (!reportServiceClient.isFallbackEnabled()) {
                throw new RuntimeException("Report Service failed to generate Project PDF: " + e.getMessage(), e);
            }
        }

        try (Connection conn = dataSource.getConnection();
             InputStream is = new ClassPathResource("reports/project_report.jrxml").getInputStream()) {
            JasperReport jasperReport = JasperCompileManager.compileReport(is);
            parameters.put("logoStream", ReportHelper.getLogoInputStream());
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, conn);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            JasperExportManager.exportReportToPdfStream(jasperPrint, baos);
            return baos.toByteArray();
        }
    }

    /** rows (id, label) of a chapter's SQL; "?" is the project id (twice for the count queries) */
    private List<String[]> rows(String sql, UUID projectId) throws Exception {
        List<String[]> result = new ArrayList<>();
        try (Connection conn = dataSource.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int i = 1; i <= ps.getParameterMetaData().getParameterCount(); i++) {
                ps.setObject(i, projectId);
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    result.add(new String[]{rs.getString(1), String.valueOf(rs.getString(2)).trim()});
                }
            }
        }
        return result;
    }

    private String projectName(UUID id) throws Exception {
        List<String[]> r = rows("SELECT id, COALESCE('[' || project_code || '] ', '') || COALESCE(project_name, '') FROM pm_customer_project WHERE id = ?", id);
        return r.isEmpty() ? "" : r.get(0)[1];
    }

}
