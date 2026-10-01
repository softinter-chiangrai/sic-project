package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.response.PmDiagramTabResponse;
import com.softinter.sicapi.entity.pm.PmDiagramTab;
import com.softinter.sicapi.repository.pm.PmDiagramTabRepository;
import com.softinter.sicapi.service.PmDiagramExportService;
import com.softinter.sicapi.service.PmDiagramTabService;
import com.softinter.sicapi.service.ReportServiceClient;
import com.softinter.sicapi.util.ReportHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
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
public class PmDiagramExportServiceImpl implements PmDiagramExportService {

    private final PmDiagramTabRepository tabRepository;
    private final PmDiagramTabService tabService;
    private final ReportServiceClient reportServiceClient;

    private static final DateTimeFormatter DISPLAY_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(ZoneId.of("Asia/Bangkok"));

    @Override
    @Transactional(readOnly = true)
    public byte[] exportDiagramPdf(UUID diagramId, UUID businessId, String lang, String imageDataUri) {
        String normalizedLang = "en".equalsIgnoreCase(lang) ? "en" : "th";
        log.info("Generating Diagram PDF: id={}, businessId={}, lang={}", diagramId, businessId, normalizedLang);

        PmDiagramTab tab = tabRepository.findById(diagramId)
                .filter(t -> businessId.equals(t.getBusinessId()) && !Boolean.TRUE.equals(t.getIsDelete()))
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลไดอะแกรม ID: " + diagramId));
        PmDiagramTabResponse info = tabService.getTab(diagramId);

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("exportDate", DISPLAY_FORMATTER.format(Instant.now()));
        parameters.put("diagramCode", orDash(tab.getDiagramCode()));
        parameters.put("diagramName", orDash(tab.getName()));
        parameters.put("diagramType", orDash(tab.getDiagramType()));
        parameters.put("projectName", orDash(info.getProjectName()));
        parameters.put("requirementTitle", orDash(info.getRequirementTitle()));
        parameters.put("version", orDash(info.getVersion()));
        parameters.put("status", orDash(info.getApprovalStatus()));
        String image = imageDataUri == null ? "" : imageDataUri.substring(imageDataUri.indexOf(',') + 1).trim();
        parameters.put("diagramImage", image);
        parameters.put("lang", normalizedLang);
        parameters.put(JRParameter.REPORT_LOCALE, "en".equals(normalizedLang) ? Locale.ENGLISH : new Locale("th", "TH"));

        // 1. Try external report-service
        try {
            return reportServiceClient.generateAndDownloadReport("pm_diagram_report", parameters, "pdf");
        } catch (Exception e) {
            log.warn("Failed to generate Diagram PDF via Report Service: {}. Checking fallback...", e.getMessage());
            if (!reportServiceClient.isFallbackEnabled()) {
                throw new RuntimeException("Report Service failed to generate Diagram PDF: " + e.getMessage(), e);
            }
        }

        // 2. Fallback: local JasperReports (no SQL — all data comes from parameters)
        try (InputStream is = new ClassPathResource("reports/diagram_report.jrxml").getInputStream()) {
            parameters.put("logoStream", ReportHelper.getLogoInputStream());
            JasperPrint print = JasperFillManager.fillReport(
                    JasperCompileManager.compileReport(is), parameters, new JREmptyDataSource(1));
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            JasperExportManager.exportReportToPdfStream(print, baos);
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate Diagram PDF locally: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating Diagram PDF: " + e.getMessage(), e);
        }
    }

    private static String orDash(String s) {
        return s != null && !s.isBlank() ? s : "-";
    }
}
