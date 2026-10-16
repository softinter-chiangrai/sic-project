package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.PmRequirementRequest;
import com.softinter.sicapi.service.PmRequirementExportService;
import com.softinter.sicapi.service.ReportServiceClient;
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
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.time.Instant;
import java.util.Locale;
import com.softinter.sicapi.util.ReportHelper;

@Slf4j
@Service
@RequiredArgsConstructor
public class PmRequirementExportServiceImpl implements PmRequirementExportService {

    private final DataSource dataSource;
    private final ReportServiceClient reportServiceClient;

    private static final DateTimeFormatter DISPLAY_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
                             .withZone(ZoneId.of("Asia/Bangkok"));

    @Override
    public byte[] exportRequirementPdf(UUID id, UUID businessId, String lang) {
        String normalizedLang = (lang != null && lang.equalsIgnoreCase("en")) ? "en" : "th";
        log.info("Exporting requirement PDF: id={}, businessId={}, lang={}", id, businessId, normalizedLang);

        String exportDate = DISPLAY_FORMATTER.format(Instant.now());

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("requirementId", id != null ? id.toString() : "");
        parameters.put("businessId", businessId != null ? businessId.toString() : "");
        parameters.put("exportDate", exportDate);
        parameters.put("lang", normalizedLang);
        parameters.put(JRParameter.REPORT_LOCALE, "en".equals(normalizedLang) ? Locale.ENGLISH : new Locale("th", "TH"));

        // 1. Try generating via external report-service
        try {
            return reportServiceClient.generateAndDownloadReport("pm_requirement_report", parameters, "pdf");
        } catch (Exception e) {
            log.warn("Failed to generate Requirement PDF via Report Service: {}. Checking fallback...", e.getMessage());
            if (!reportServiceClient.isFallbackEnabled()) {
                throw new RuntimeException("Report Service failed to generate PDF: " + e.getMessage(), e);
            }
        }

        // 2. Fallback: Local JasperReports generation
        log.info("Falling back to local JasperReports generation for requirement: id={}", id);
        try (Connection conn = dataSource.getConnection();
             InputStream is = new ClassPathResource("reports/requirement_report.jrxml").getInputStream()) {

            JasperReport jasperReport = JasperCompileManager.compileReport(is);

            parameters.put("logoStream", ReportHelper.getLogoInputStream());

            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, conn);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            JasperExportManager.exportReportToPdfStream(jasperPrint, baos);

            log.info("Requirement PDF local export success: id={}, size={} bytes", id, baos.size());
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate Requirement PDF locally for id={}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Error generating Requirement PDF: " + e.getMessage(), e);
        }
    }

    // compiled once: the live preview fills it every time the user stops typing
    private static volatile JasperReport previewReport;

    @Override
    public byte[] previewRequirementPdf(PmRequirementRequest form, UUID businessId, String userName, String lang) {
        if (form.getProjectId() == null) {
            throw new IllegalArgumentException("กรุณาเลือกโครงการก่อนดูตัวอย่างเอกสาร");
        }
        String normalizedLang = "en".equalsIgnoreCase(lang) ? "en" : "th";
        try (Connection conn = dataSource.getConnection()) {
            boolean autoCommit = conn.getAutoCommit();
            conn.setAutoCommit(false);
            try {
                // the template reads pm_requirement by id: put the form's values there, only inside this transaction
                UUID id = writeFormValues(conn, form, businessId, userName);
                if (previewReport == null) {
                    try (InputStream is = new ClassPathResource("reports/requirement_report.jrxml").getInputStream()) {
                        previewReport = JasperCompileManager.compileReport(is);
                    }
                }
                Map<String, Object> parameters = new HashMap<>();
                parameters.put("requirementId", id.toString());
                parameters.put("businessId", businessId.toString());
                parameters.put("exportDate", DISPLAY_FORMATTER.format(Instant.now()));
                parameters.put("lang", normalizedLang);
                parameters.put(JRParameter.REPORT_LOCALE, "en".equals(normalizedLang) ? Locale.ENGLISH : new Locale("th", "TH"));
                parameters.put("logoStream", ReportHelper.getLogoInputStream());
                return JasperExportManager.exportReportToPdf(JasperFillManager.fillReport(previewReport, parameters, conn));
            } finally {
                conn.rollback(); // nothing of the preview is stored
                conn.setAutoCommit(autoCommit);
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Requirement preview failed: {}", e.getMessage(), e);
            throw new RuntimeException("สร้างตัวอย่างเอกสารไม่สำเร็จ: " + e.getMessage(), e);
        }
    }

    /** UPDATE the saved requirement, or INSERT a temporary one for a form that was never saved; returns the id to report on */
    private UUID writeFormValues(Connection conn, PmRequirementRequest f, UUID businessId, String userName) throws Exception {
        // the project comes from the client: it must be one of this business, or the preview would print another business's data
        try (PreparedStatement ps = conn.prepareStatement("SELECT 1 FROM pm_customer_project WHERE id = ? AND business_id = ? AND is_delete = false")) {
            ps.setObject(1, f.getProjectId());
            ps.setObject(2, businessId);
            try (var rs = ps.executeQuery()) {
                if (!rs.next()) {
                    throw new IllegalArgumentException("ไม่พบโครงการนี้ในธุรกิจของคุณ");
                }
            }
        }
        if (f.getId() != null) {
            try (PreparedStatement ps = conn.prepareStatement(
                    "UPDATE pm_requirement SET requirement_code = COALESCE(NULLIF(?, ''), requirement_code), title = COALESCE(NULLIF(?, ''), '-'), "
                            + "description = ?, requirement_type = ?, source = ?, priority = ?, business_value = ?, acceptance_criteria = ?, "
                            + "status = COALESCE(?, status), project_id = ? WHERE id = ? AND business_id = ?")) {
                bind(ps, f);
                ps.setObject(11, f.getId());
                ps.setObject(12, businessId);
                if (ps.executeUpdate() == 1) {
                    return f.getId();
                }
            }
        }
        UUID id = UUID.randomUUID();
        try (PreparedStatement ps = conn.prepareStatement(
                "INSERT INTO pm_requirement (requirement_code, title, description, requirement_type, source, priority, business_value, "
                        + "acceptance_criteria, status, project_id, id, business_id, created_by, created_date, updated_date, is_delete) "
                        + "VALUES (COALESCE(NULLIF(?, ''), '-'), COALESCE(NULLIF(?, ''), '-'), ?, ?, ?, ?, ?, ?, COALESCE(?, 'Draft'), ?, ?, ?, ?, now(), now(), false)")) {
            bind(ps, f);
            ps.setObject(11, id);
            ps.setObject(12, businessId);
            ps.setString(13, userName != null ? userName : "system");
            ps.executeUpdate();
        }
        return id;
    }

    private static void bind(PreparedStatement ps, PmRequirementRequest f) throws Exception {
        ps.setString(1, f.getRequirementCode());
        ps.setString(2, f.getTitle());
        ps.setString(3, f.getDescription());
        ps.setString(4, f.getRequirementType());
        ps.setString(5, f.getSource());
        ps.setString(6, f.getPriority());
        ps.setString(7, f.getBusinessValue());
        ps.setString(8, f.getAcceptanceCriteria());
        ps.setString(9, f.getStatus());
        ps.setObject(10, f.getProjectId());
    }
}

