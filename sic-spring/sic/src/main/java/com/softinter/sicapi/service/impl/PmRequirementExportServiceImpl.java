package com.softinter.sicapi.service.impl;

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
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PmRequirementExportServiceImpl implements PmRequirementExportService {

    private final DataSource dataSource;
    private final ReportServiceClient reportServiceClient;
    private final com.softinter.sicapi.repository.pm.PmRequirementRepository requirementRepository;
    private final com.softinter.sicapi.repository.su.SuUploadRepository uploadRepository;
    private final com.softinter.sicapi.service.FileStorageService fileStorageService;

    private static final DateTimeFormatter DISPLAY_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
                             .withZone(ZoneId.of("Asia/Bangkok"));

    /** ดึงไฟล์รูปในเอกสารแนบของ requirement จาก storage เพื่อฝังท้ายรายงาน (ไฟล์ที่ไม่ใช่รูปแสดงเป็นชื่อไฟล์เหมือนเดิม) */
    private java.util.List<com.softinter.sicapi.util.ReportHelper.ContentBlock> loadAttachmentImages(UUID id) {
        java.util.List<byte[]> images = new java.util.ArrayList<>();
        if (id != null) {
            requirementRepository.findById(id).map(r -> r.getUploadGroupId()).ifPresent(groupId ->
                uploadRepository.findAllByUploadGroupIdAndIsActiveTrueOrderByCreatedDateDesc(groupId).stream()
                    .filter(u -> u.getContentType() != null && u.getContentType().startsWith("image/"))
                    .forEach(u -> {
                        try (InputStream in = fileStorageService.downloadFile(u.getId()).getInputStream()) {
                            images.add(in.readAllBytes());
                        } catch (Exception e) {
                            log.warn("Skip attachment image {} in requirement PDF: {}", u.getId(), e.getMessage());
                        }
                    }));
        }
        return com.softinter.sicapi.util.ReportHelper.imageBlocks(images);
    }

    @Override
    public byte[] exportRequirementPdf(UUID id, UUID businessId, String lang) {
        String normalizedLang = (lang != null && lang.equalsIgnoreCase("en")) ? "en" : "th";
        log.info("Exporting requirement PDF: id={}, businessId={}, lang={}", id, businessId, normalizedLang);

        String exportDate = DISPLAY_FORMATTER.format(java.time.Instant.now());

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("requirementId", id != null ? id.toString() : "");
        parameters.put("businessId", businessId != null ? businessId.toString() : "");
        parameters.put("exportDate", exportDate);
        parameters.put("lang", normalizedLang);
        parameters.put(JRParameter.REPORT_LOCALE, "en".equals(normalizedLang) ? java.util.Locale.ENGLISH : new java.util.Locale("th", "TH"));

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

            parameters.put("logoStream", com.softinter.sicapi.util.ReportHelper.getLogoInputStream());
            parameters.put("attachmentImages", loadAttachmentImages(id));

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
}

