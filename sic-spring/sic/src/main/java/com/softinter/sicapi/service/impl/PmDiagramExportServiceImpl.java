package com.softinter.sicapi.service.impl;

import com.lowagie.text.Document;
import com.lowagie.text.pdf.PdfCopy;
import com.lowagie.text.pdf.PdfReader;
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
import java.util.*;

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
    public byte[] exportDiagramPdf(UUID diagramId, UUID businessId, String lang, String imageDataUri, List<Map<String, Object>> requestPages) {
        String normalizedLang = "en".equalsIgnoreCase(lang) ? "en" : "th";
        log.info("Generating Diagram PDF: id={}, businessId={}, lang={}", diagramId, businessId, normalizedLang);

        PmDiagramTab tab = tabRepository.findById(diagramId)
                .filter(t -> businessId.equals(t.getBusinessId()) && !Boolean.TRUE.equals(t.getIsDelete()))
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลไดอะแกรม ID: " + diagramId));
        PmDiagramTabResponse info = tabService.getTab(diagramId);

        Map<String, Object> baseParams = buildBaseParameters(tab, info, normalizedLang);

        List<Map<String, Object>> pages = requestPages != null && !requestPages.isEmpty()
                ? requestPages
                : extractPagesFromGraphData(tab.getGraphData());

        if (!pages.isEmpty() && pages.size() > 1) {
            List<byte[]> pdfList = new ArrayList<>();
            for (Map<String, Object> page : pages) {
                Map<String, Object> params = new HashMap<>(baseParams);
                String pageName = (String) page.get("pageName");
                if (pageName != null && !pageName.isBlank()) {
                    params.put("diagramName", orDash(tab.getName()) + " (" + pageName + ")");
                }
                String pagePng = (String) page.get("png");
                String img = pagePng != null ? pagePng.substring(pagePng.indexOf(',') + 1).trim() : "";
                params.put("diagramImage", img);
                pdfList.add(generateSingleDiagramPdf(params));
            }
            return mergePdfs(pdfList);
        }


        if (imageDataUri == null && tab.getGraphData() != null && tab.getGraphData().get("png") instanceof String s) {
            imageDataUri = s;
        }
        String image = imageDataUri == null ? "" : imageDataUri.substring(imageDataUri.indexOf(',') + 1).trim();
        baseParams.put("diagramImage", image);

        return generateSingleDiagramPdf(baseParams);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportAllDiagramsPdf(UUID projectId, UUID currentDiagramId, UUID businessId, String lang, String currentImageDataUri) {
        String normalizedLang = "en".equalsIgnoreCase(lang) ? "en" : "th";
        log.info("Generating All Diagrams PDF: projectId={}, currentDiagramId={}, businessId={}, lang={}",
                projectId, currentDiagramId, businessId, normalizedLang);

        List<PmDiagramTab> tabs = tabRepository.findByBusinessIdAndProjectIdAndIsDeleteFalseOrderBySortOrderAscCreatedDateAsc(businessId, projectId);
        if (tabs.isEmpty()) {
            tabs = tabRepository.findByProjectIdAndIsDeleteFalseOrderBySortOrderAscCreatedDateAsc(projectId);
        }
        if (tabs.isEmpty()) {
            throw new RuntimeException("ไม่พบข้อมูลไดอะแกรมในโครงการนี้");
        }

        List<byte[]> allPdfs = new ArrayList<>();

        for (PmDiagramTab tab : tabs) {
            PmDiagramTabResponse info = tabService.getTab(tab.getId());
            Map<String, Object> baseParams = buildBaseParameters(tab, info, normalizedLang);

            List<Map<String, Object>> pages = extractPagesFromGraphData(tab.getGraphData());
            if (!pages.isEmpty() && pages.size() > 1) {
                for (Map<String, Object> page : pages) {
                    Map<String, Object> params = new HashMap<>(baseParams);
                    String pageName = (String) page.get("pageName");
                    if (pageName != null && !pageName.isBlank()) {
                        params.put("diagramName", orDash(tab.getName()) + " (" + pageName + ")");
                    }
                    String pagePng = (String) page.get("png");
                    String img = pagePng != null ? pagePng.substring(pagePng.indexOf(',') + 1).trim() : "";
                    params.put("diagramImage", img);
                    allPdfs.add(generateSingleDiagramPdf(params));
                }
            } else {
                String imageDataUri = null;
                if (currentDiagramId != null && currentDiagramId.equals(tab.getId()) && currentImageDataUri != null) {
                    imageDataUri = currentImageDataUri;
                } else if (tab.getGraphData() != null && tab.getGraphData().get("png") instanceof String s) {
                    imageDataUri = s;
                }

                String image = imageDataUri == null ? "" : imageDataUri.substring(imageDataUri.indexOf(',') + 1).trim();
                baseParams.put("diagramImage", image);
                allPdfs.add(generateSingleDiagramPdf(baseParams));
            }
        }

        return mergePdfs(allPdfs);
    }

    private Map<String, Object> buildBaseParameters(PmDiagramTab tab, PmDiagramTabResponse info, String normalizedLang) {
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("exportDate", DISPLAY_FORMATTER.format(Instant.now()));
        parameters.put("diagramCode", orDash(tab.getDiagramCode()));
        parameters.put("diagramName", orDash(tab.getName()));
        parameters.put("diagramType", orDash(tab.getDiagramType()));
        parameters.put("projectName", orDash(info.getProjectName()));
        parameters.put("requirementTitle", orDash(info.getRequirementTitle()));
        parameters.put("version", orDash(info.getVersion()));
        parameters.put("status", orDash(info.getApprovalStatus()));
        parameters.put("lang", normalizedLang);
        parameters.put(JRParameter.REPORT_LOCALE, "en".equals(normalizedLang) ? Locale.ENGLISH : new Locale("th", "TH"));
        return parameters;
    }

    private byte[] generateSingleDiagramPdf(Map<String, Object> parameters) {
        // 1. Try external report-service FIRST (Preserves exact fonts, layout, and Thai Sarabun font)
        try {
            return reportServiceClient.generateAndDownloadReport("pm_diagram_report", parameters, "pdf");
        } catch (Exception e) {
            log.warn("Failed to generate Diagram PDF via Report Service: {}. Checking fallback...", e.getMessage());
            if (!reportServiceClient.isFallbackEnabled()) {
                throw new RuntimeException("Report Service failed to generate Diagram PDF: " + e.getMessage(), e);
            }
        }

        // 2. Fallback: local JasperReports
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

    private byte[] mergePdfs(List<byte[]> pdfs) {
        if (pdfs.isEmpty()) {
            throw new RuntimeException("ไม่มีเอกสารสำหรับสร้าง PDF รวม");
        }
        if (pdfs.size() == 1) {
            return pdfs.get(0);
        }
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document document = new Document();
            PdfCopy copy = new PdfCopy(document, baos);
            document.open();
            for (byte[] pdfBytes : pdfs) {
                if (pdfBytes == null || pdfBytes.length == 0) continue;
                PdfReader reader = new PdfReader(pdfBytes);
                int numberOfPages = reader.getNumberOfPages();
                for (int p = 1; p <= numberOfPages; p++) {
                    copy.addPage(copy.getImportedPage(reader, p));
                }
                copy.freeReader(reader);
                reader.close();
            }
            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to merge PDFs: {}", e.getMessage(), e);
            throw new RuntimeException("Error merging PDFs: " + e.getMessage(), e);
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> extractPagesFromGraphData(Map<String, Object> graphData) {
        if (graphData == null) return List.of();
        Object pagesObj = graphData.get("pages");
        if (pagesObj instanceof List<?> list && !list.isEmpty()) {
            List<Map<String, Object>> result = new ArrayList<>();
            for (Object item : list) {
                if (item instanceof Map<?, ?> m) {
                    result.add((Map<String, Object>) m);
                }
            }
            return result;
        }
        return List.of();
    }

    private static String orDash(String s) {
        return s != null && !s.isBlank() ? s : "-";
    }
}
