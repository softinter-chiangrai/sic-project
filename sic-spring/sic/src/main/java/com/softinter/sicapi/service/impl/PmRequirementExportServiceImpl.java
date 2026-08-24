package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.entity.pm.PmRequirement;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.repository.pm.PmRequirementRepository;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.su.SuProfileRepository;
import com.softinter.sicapi.service.PmRequirementExportService;
import com.softinter.sicapi.util.LocalizationHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * PmRequirementExportServiceImpl
 * <p>
 * Service implementation สำหรับ export เอกสาร Requirement เป็น PDF
 * โดยใช้ JasperReports กับ template .jrxml ที่อยู่ใน classpath
 * </p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PmRequirementExportServiceImpl implements PmRequirementExportService {

    private final PmRequirementRepository requirementRepository;
    private final PmCustomerProjectRepository projectRepository;
    private final SuProfileRepository profileRepository;

    private static final DateTimeFormatter DISPLAY_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
                             .withZone(ZoneId.of("Asia/Bangkok"));

    // ── DTO ─────────────────────────────────────────────────────────
    /**
     * DTO ที่ใช้เป็น datasource ให้ JasperReports
     * ทุก field ต้องมี getter ที่ตรงกับ <field> ใน .jrxml
     */
    public static class RequirementReportDto {
        private final String requirementCode;
        private final String title;
        private final String description;
        private final String requirementType;
        private final String source;
        private final String priority;
        private final String businessValue;
        private final String acceptanceCriteria;
        private final String projectName;
        private final String customerName;
        private final String status;
        private final String version;
        private final String createdBy;
        private final String createdDate;

        public RequirementReportDto(
                String requirementCode, String title, String description,
                String requirementType, String source, String priority,
                String businessValue, String acceptanceCriteria,
                String projectName, String customerName,
                String status, String version,
                String createdBy, String createdDate) {
            this.requirementCode  = nvl(requirementCode);
            this.title            = nvl(title);
            this.description      = nvl(description);
            this.requirementType  = nvl(requirementType);
            this.source           = nvl(source);
            this.priority         = nvl(priority);
            this.businessValue    = nvl(businessValue);
            this.acceptanceCriteria = nvl(acceptanceCriteria);
            this.projectName      = nvl(projectName);
            this.customerName     = nvl(customerName);
            this.status           = nvl(status);
            this.version          = nvl(version);
            this.createdBy        = nvl(createdBy);
            this.createdDate      = nvl(createdDate);
        }

        private static String nvl(String s) { return s != null ? s : "-"; }

        // Getters (JasperReports ต้องการ)
        public String getRequirementCode()   { return requirementCode; }
        public String getTitle()             { return title; }
        public String getDescription()       { return description; }
        public String getRequirementType()   { return requirementType; }
        public String getSource()            { return source; }
        public String getPriority()          { return priority; }
        public String getBusinessValue()     { return businessValue; }
        public String getAcceptanceCriteria(){ return acceptanceCriteria; }
        public String getProjectName()       { return projectName; }
        public String getCustomerName()      { return customerName; }
        public String getStatus()            { return status; }
        public String getVersion()           { return version; }
        public String getCreatedBy()         { return createdBy; }
        public String getCreatedDate()       { return createdDate; }
    }

    // ── Main Export ──────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public byte[] exportRequirementPdf(UUID id, UUID businessId) {
        log.info("Exporting requirement PDF: id={}, businessId={}", id, businessId);

        // 1. Load entity
        PmRequirement req = requirementRepository
                .findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new RuntimeException("ไม่พบ Requirement ID: " + id));

        // 2. Resolve project & customer name
        String projectName  = "N/A";
        String customerName = "N/A";

        if (req.getProjectId() != null) {
            Optional<PmCustomerProject> projectOpt = projectRepository.findById(req.getProjectId());
            if (projectOpt.isPresent()) {
                PmCustomerProject project = projectOpt.get();
                projectName = project.getProjectName();
                if (project.getCustomer() != null) {
                    customerName = project.getCustomer().getCompanyNameLocal();
                    if (customerName == null || customerName.isBlank()) {
                        customerName = project.getCustomer().getCompanyNameEn();
                    }
                }
            }
        }

        // 3. Resolve created-by display name
        String createdByName = (req.getCreatedBy() != null)
                ? profileRepository.findByUserId(req.getCreatedBy())
                        .map(LocalizationHelper::getFullName)
                        .orElse(req.getCreatedBy())
                : "-";

        // 4. Format dates
        String createdDateStr = (req.getCreatedDate() != null)
                ? DISPLAY_FORMATTER.format(req.getCreatedDate())
                : "-";

        String exportDate = DISPLAY_FORMATTER.format(java.time.Instant.now());

        // 5. Build DTO list for datasource (one row = one requirement)
        RequirementReportDto dto = new RequirementReportDto(
                req.getRequirementCode(),
                req.getTitle(),
                stripHtml(req.getDescription()),
                req.getRequirementType(),
                req.getSource(),
                req.getPriority(),
                req.getBusinessValue(),
                stripHtml(req.getAcceptanceCriteria()),
                projectName,
                customerName,
                req.getStatus(),
                req.getVersion(),
                createdByName,
                createdDateStr
        );

        List<RequirementReportDto> dataList = Collections.singletonList(dto);

        // 6. Compile & fill JasperReport
        try {
            // Load .jrxml from classpath
            ClassPathResource templateResource = new ClassPathResource("reports/requirement_report.jrxml");
            JasperReport jasperReport;
            try (InputStream is = templateResource.getInputStream()) {
                jasperReport = JasperCompileManager.compileReport(is);
            }

            // Parameters
            Map<String, Object> parameters = new HashMap<>();
            parameters.put("exportDate", exportDate);

            // Data source
            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(dataList);

            // Fill report
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);

            // Export to PDF bytes
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            JasperExportManager.exportReportToPdfStream(jasperPrint, baos);

            log.info("Requirement PDF export success: id={}, size={} bytes", id, baos.size());
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate Requirement PDF for id={}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Error generating Requirement PDF: " + e.getMessage(), e);
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────

    /**
     * ลบ HTML tags ออกจาก rich-text content เพื่อแสดงใน PDF ได้
     * (JasperReports 6.x ไม่รองรับ HTML markup โดย default)
     */
    private String stripHtml(String html) {
        if (html == null || html.isBlank()) return "-";
        // ลบ tags ทั้งหมด แล้ว decode entities พื้นฐาน
        String plain = html
                .replaceAll("<br\\s*/?>", "\n")
                .replaceAll("<p[^>]*>", "\n")
                .replaceAll("</p>", "")
                .replaceAll("<li[^>]*>", "\n• ")
                .replaceAll("</li>", "")
                .replaceAll("<[^>]+>", "")
                .replace("&nbsp;", " ")
                .replace("&amp;", "&")
                .replace("&lt;", "<")
                .replace("&gt;", ">")
                .replace("&quot;", "\"")
                .replaceAll("\\n{3,}", "\n\n")
                .trim();
        return plain.isEmpty() ? "-" : plain;
    }
}
