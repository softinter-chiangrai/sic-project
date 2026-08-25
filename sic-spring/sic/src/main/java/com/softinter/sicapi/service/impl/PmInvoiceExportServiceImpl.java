package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.service.PmInvoiceExportService;
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
public class PmInvoiceExportServiceImpl implements PmInvoiceExportService {

    private final DataSource dataSource;

    private static final DateTimeFormatter DISPLAY_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(ZoneId.of("Asia/Bangkok"));

    @Override
    public byte[] exportInvoicePdf(UUID invoiceId, UUID businessId) {
        log.info("Generating Invoice PDF: id={}, businessId={}", invoiceId, businessId);

        String exportDate = DISPLAY_FORMATTER.format(java.time.Instant.now());

        try (Connection conn = dataSource.getConnection();
             InputStream is = new ClassPathResource("reports/invoice_report.jrxml").getInputStream()) {

            JasperReport jasperReport = JasperCompileManager.compileReport(is);

            Map<String, Object> parameters = new HashMap<>();
            parameters.put("invoiceId", invoiceId != null ? invoiceId.toString() : "");
            parameters.put("exportDate", exportDate);
            parameters.put("logoStream", com.softinter.sicapi.util.ReportHelper.getLogoInputStream());

            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, conn);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            JasperExportManager.exportReportToPdfStream(jasperPrint, baos);

            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate Invoice PDF: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating Invoice PDF: " + e.getMessage(), e);
        }
    }
}

