package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.entity.pm.PmDelivery;
import com.softinter.sicapi.entity.pm.PmUserManual;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmDeliveryRepository;
import com.softinter.sicapi.repository.pm.PmUserManualRepository;
import com.softinter.sicapi.service.PmUserManualExportService;
import com.softinter.sicapi.service.ReportServiceClient;
import com.softinter.sicapi.util.ReportHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
public class PmUserManualExportServiceImpl implements PmUserManualExportService {

    private final PmUserManualRepository userManualRepository;
    private final PmCustomerProjectRepository projectRepository;
    private final PmDeliveryRepository deliveryRepository;
    private final DataSource dataSource;
    private final ReportServiceClient reportServiceClient;

    private static final DateTimeFormatter DISPLAY_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(ZoneId.of("Asia/Bangkok"));

    @Override
    @Transactional(readOnly = true)
    public byte[] exportUserManualPdf(UUID manualId, UUID businessId) {
        log.info("Generating User Manual PDF: id={}, businessId={}", manualId, businessId);

        PmUserManual manual = userManualRepository.findById(manualId)
                .filter(m -> businessId.equals(m.getBusinessId()) && !Boolean.TRUE.equals(m.getIsDelete()))
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลคู่มือการใช้งาน ID: " + manualId));

        String projectName = "-";
        if (manual.getProjectId() != null) {
            projectName = projectRepository.findById(manual.getProjectId())
                    .map(PmCustomerProject::getProjectName).orElse("-");
        }

        String deliveryCode = "-";
        if (manual.getDeliveryId() != null) {
            deliveryCode = deliveryRepository.findById(manual.getDeliveryId())
                    .map(PmDelivery::getDeliveryCode).orElse("-");
        }

        String exportDate = DISPLAY_FORMATTER.format(java.time.Instant.now());

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("manualId", manualId != null ? manualId.toString() : "");
        parameters.put("businessId", businessId != null ? businessId.toString() : "");
        parameters.put("exportDate", exportDate);
        parameters.put("manualCode", manual.getManualCode() != null ? manual.getManualCode() : "-");
        parameters.put("manualTitle", manual.getManualTitle() != null ? manual.getManualTitle() : "-");
        parameters.put("projectName", projectName);
        parameters.put("manualType", getManualTypeLabel(manual.getManualType()));
        parameters.put("version", manual.getVersion() != null ? manual.getVersion() : "1.0");
        parameters.put("status", manual.getStatus() != null ? manual.getStatus() : "-");
        parameters.put("deliveryCode", deliveryCode);

        // 1. Try generating via external report-service
        try {
            return reportServiceClient.generateAndDownloadReport("pm_user_manual_report", parameters, "pdf");
        } catch (Exception e) {
            log.warn("Failed to generate User Manual PDF via Report Service: {}. Checking fallback...", e.getMessage());
            if (!reportServiceClient.isFallbackEnabled()) {
                throw new RuntimeException("Report Service failed to generate User Manual PDF: " + e.getMessage(), e);
            }
        }

        // 2. Fallback: Local JasperReports generation
        log.info("Falling back to local JasperReports generation for user manual: id={}", manualId);
        try (Connection conn = dataSource.getConnection();
             InputStream is = new ClassPathResource("reports/user_manual_report.jrxml").getInputStream()) {

            JasperReport jasperReport = JasperCompileManager.compileReport(is);

            parameters.put("logoStream", ReportHelper.getLogoInputStream());

            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, conn);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            JasperExportManager.exportReportToPdfStream(jasperPrint, baos);

            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate User Manual PDF locally: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating User Manual PDF: " + e.getMessage(), e);
        }
    }

    private String getManualTypeLabel(String type) {
        if (type == null) return "User Manual";
        return switch (type.toUpperCase()) {
            case "USER" -> "User Manual (คู่มือผู้ใช้งานทั่วไป)";
            case "ADMIN" -> "Admin Manual (คู่มือผู้ดูแลระบบ)";
            case "INSTALLATION" -> "Installation Manual (คู่มือการติดตั้ง)";
            case "OPERATION" -> "Operation Manual (คู่มือการปฏิบัติงาน)";
            case "TROUBLESHOOT" -> "Troubleshooting Guide (คู่มือแก้ปัญหา)";
            default -> type;
        };
    }
}
