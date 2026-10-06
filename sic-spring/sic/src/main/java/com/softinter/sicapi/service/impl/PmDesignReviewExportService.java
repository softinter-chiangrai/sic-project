package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.service.ReportServiceClient;
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
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PmDesignReviewExportService {

    private final DataSource dataSource;
    private final ReportServiceClient reportServiceClient;

    private static final DateTimeFormatter DISPLAY_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(ZoneId.of("Asia/Bangkok"));

    public byte[] exportPdf(UUID id, UUID businessId, String lang) {
        String normalizedLang = "en".equalsIgnoreCase(lang) ? "en" : "th";
        log.info("Generating Design Review PDF: id={}, businessId={}, lang={}", id, businessId, normalizedLang);

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("designReviewId", id.toString());
        parameters.put("businessId", businessId.toString());
        parameters.put("exportDate", DISPLAY_FORMATTER.format(Instant.now()));
        parameters.put("lang", normalizedLang);
        parameters.put(JRParameter.REPORT_LOCALE, "en".equals(normalizedLang) ? Locale.ENGLISH : new Locale("th", "TH"));

        try {
            return reportServiceClient.generateAndDownloadReport("pm_design_review_report", parameters, "pdf");
        } catch (Exception e) {
            log.warn("Failed to generate Design Review PDF via Report Service: {}. Checking fallback...", e.getMessage());
            if (!reportServiceClient.isFallbackEnabled()) {
                throw new RuntimeException("Report Service failed to generate Design Review PDF: " + e.getMessage(), e);
            }
        }

        try (Connection conn = dataSource.getConnection();
             InputStream is = new ClassPathResource("reports/design_review_report.jrxml").getInputStream()) {
            parameters.put("logoStream", ReportHelper.getLogoInputStream());
            JasperPrint print = JasperFillManager.fillReport(JasperCompileManager.compileReport(is), parameters, conn);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            JasperExportManager.exportReportToPdfStream(print, baos);
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate Design Review PDF locally: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating Design Review PDF: " + e.getMessage(), e);
        }
    }
}
