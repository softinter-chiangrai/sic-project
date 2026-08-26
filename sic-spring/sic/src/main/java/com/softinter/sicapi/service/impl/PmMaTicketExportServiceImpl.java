package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.service.PmMaTicketExportService;
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
public class PmMaTicketExportServiceImpl implements PmMaTicketExportService {

    private final DataSource dataSource;
    private final ReportServiceClient reportServiceClient;

    private static final DateTimeFormatter DISPLAY_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(ZoneId.of("Asia/Bangkok"));

    @Override
    public byte[] exportTicketPdf(UUID ticketId, UUID businessId) {
        log.info("Generating Ticket PDF: id={}, businessId={}", ticketId, businessId);

        String exportDate = DISPLAY_FORMATTER.format(java.time.Instant.now());

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("ticketId", ticketId != null ? ticketId.toString() : "");
        parameters.put("businessId", businessId != null ? businessId.toString() : "");
        parameters.put("exportDate", exportDate);

        // 1. Try generating via external report-service
        try {
            return reportServiceClient.generateAndDownloadReport("pm_ticket_report", parameters, "pdf");
        } catch (Exception e) {
            log.warn("Failed to generate Ticket PDF via Report Service: {}. Checking fallback...", e.getMessage());
            if (!reportServiceClient.isFallbackEnabled()) {
                throw new RuntimeException("Report Service failed to generate Ticket PDF: " + e.getMessage(), e);
            }
        }

        // 2. Fallback: Local JasperReports generation
        log.info("Falling back to local JasperReports generation for ticket: id={}", ticketId);
        try (Connection conn = dataSource.getConnection();
             InputStream is = new ClassPathResource("reports/ticket_report.jrxml").getInputStream()) {

            JasperReport jasperReport = JasperCompileManager.compileReport(is);

            parameters.put("logoStream", com.softinter.sicapi.util.ReportHelper.getLogoInputStream());

            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, conn);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            JasperExportManager.exportReportToPdfStream(jasperPrint, baos);

            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate Ticket PDF locally: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating Ticket PDF: " + e.getMessage(), e);
        }
    }
}

