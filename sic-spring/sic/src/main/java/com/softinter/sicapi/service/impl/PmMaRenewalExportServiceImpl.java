package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.service.PmMaRenewalExportService;
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
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PmMaRenewalExportServiceImpl implements PmMaRenewalExportService {

    private final DataSource dataSource;
    private final ReportServiceClient reportServiceClient;

    private static final DateTimeFormatter DISPLAY_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(ZoneId.of("Asia/Bangkok"));

    @Override
    public byte[] exportRenewalPdf(UUID renewalId, UUID businessId) {
        log.info("Generating Renewal PDF: id={}, businessId={}", renewalId, businessId);

        String exportDate = DISPLAY_FORMATTER.format(java.time.Instant.now());

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("renewalId", renewalId != null ? renewalId.toString() : "");
        parameters.put("businessId", businessId != null ? businessId.toString() : "");
        parameters.put("exportDate", exportDate);

        // 1. Try generating via external report-service
        try {
            return reportServiceClient.generateAndDownloadReport("pm_renewal_report", parameters, "pdf");
        } catch (Exception e) {
            log.warn("Failed to generate Renewal PDF via Report Service: {}. Checking fallback...", e.getMessage());
            if (!reportServiceClient.isFallbackEnabled()) {
                throw new RuntimeException("Report Service failed to generate Renewal PDF: " + e.getMessage(), e);
            }
        }

        // 2. Fallback: Local JasperReports generation
        log.info("Falling back to local JasperReports generation for renewal: id={}", renewalId);
        try (Connection conn = dataSource.getConnection();
             InputStream is = new ClassPathResource("reports/renewal_report.jrxml").getInputStream()) {

            JasperReport jasperReport = JasperCompileManager.compileReport(is);

            parameters.put("logoStream", com.softinter.sicapi.util.ReportHelper.getLogoInputStream());

            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, conn);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            JasperExportManager.exportReportToPdfStream(jasperPrint, baos);

            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate Renewal PDF locally: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating Renewal PDF: " + e.getMessage(), e);
        }
    }
}

