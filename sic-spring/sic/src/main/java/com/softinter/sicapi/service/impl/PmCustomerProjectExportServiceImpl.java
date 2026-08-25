package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.service.PmCustomerProjectExportService;
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
public class PmCustomerProjectExportServiceImpl implements PmCustomerProjectExportService {

    private final DataSource dataSource;

    private static final DateTimeFormatter DISPLAY_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
                             .withZone(ZoneId.of("Asia/Bangkok"));

    @Override
    public byte[] exportProjectPdf(UUID id, UUID businessId) {
        log.info("Generating Project PDF: id={}, businessId={}", id, businessId);

        String exportDate = DISPLAY_FORMATTER.format(java.time.Instant.now());

        try (Connection conn = dataSource.getConnection();
             InputStream is = new ClassPathResource("reports/project_report.jrxml").getInputStream()) {

            JasperReport jasperReport = JasperCompileManager.compileReport(is);

            Map<String, Object> parameters = new HashMap<>();
            parameters.put("projectId", id != null ? id.toString() : "");
            parameters.put("exportDate", exportDate);
            parameters.put("logoStream", com.softinter.sicapi.util.ReportHelper.getLogoInputStream());

            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, conn);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            JasperExportManager.exportReportToPdfStream(jasperPrint, baos);

            log.info("Project PDF export success: id={}, size={} bytes", id, baos.size());
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate Project PDF for id={}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Error generating Project PDF: " + e.getMessage(), e);
        }
    }
}

