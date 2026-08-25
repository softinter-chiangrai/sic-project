package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.entity.pm.PmRequirement;
import com.softinter.sicapi.entity.pm.PmSpecification;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmRequirementRepository;
import com.softinter.sicapi.repository.pm.PmSpecificationRepository;
import com.softinter.sicapi.service.PmSpecificationExportService;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class PmSpecificationExportServiceImpl implements PmSpecificationExportService {

    private final PmSpecificationRepository specificationRepository;
    private final PmCustomerProjectRepository projectRepository;
    private final PmRequirementRepository requirementRepository;

    private static final DateTimeFormatter DISPLAY_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(ZoneId.of("Asia/Bangkok"));

    public static class SpecificationReportDto {
        private final String specificationCode;
        private final String title;
        private final String specificationType;
        private final String version;
        private final String status;
        private final String priority;
        private final String owner;
        private final String estimatedManday;
        private final String projectName;
        private final String requirementTitle;
        private final String description;
        private final String createdDate;

        public SpecificationReportDto(String specificationCode, String title, String specificationType,
                                      String version, String status, String priority,
                                      String owner, String estimatedManday, String projectName,
                                      String requirementTitle, String description, String createdDate) {
            this.specificationCode = specificationCode;
            this.title = title;
            this.specificationType = specificationType;
            this.version = version;
            this.status = status;
            this.priority = priority;
            this.owner = owner;
            this.estimatedManday = estimatedManday;
            this.projectName = projectName;
            this.requirementTitle = requirementTitle;
            this.description = description;
            this.createdDate = createdDate;
        }

        public String getSpecificationCode() { return specificationCode; }
        public String getTitle() { return title; }
        public String getSpecificationType() { return specificationType; }
        public String getVersion() { return version; }
        public String getStatus() { return status; }
        public String getPriority() { return priority; }
        public String getOwner() { return owner; }
        public String getEstimatedManday() { return estimatedManday; }
        public String getProjectName() { return projectName; }
        public String getRequirementTitle() { return requirementTitle; }
        public String getDescription() { return description; }
        public String getCreatedDate() { return createdDate; }
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportSpecificationPdf(UUID specId, UUID businessId) {
        log.info("Generating Specification PDF: id={}, businessId={}", specId, businessId);

        PmSpecification spec = specificationRepository.findById(specId)
                .orElseThrow(() -> new RuntimeException("Specification not found: " + specId));

        String projectName = "-";
        if (spec.getProject() != null) {
            projectName = spec.getProject().getProjectName();
        }

        String reqTitle = "-";
        if (spec.getRequirement() != null) {
            reqTitle = spec.getRequirement().getTitle();
        }

        String createdDateStr = spec.getCreatedDate() != null
                ? DISPLAY_FORMATTER.format(spec.getCreatedDate()) : "-";
        String exportDate = DISPLAY_FORMATTER.format(java.time.Instant.now());

        SpecificationReportDto dto = new SpecificationReportDto(
                spec.getSpecificationCode(),
                com.softinter.sicapi.util.ReportHelper.thaify(spec.getTitle()),
                com.softinter.sicapi.util.ReportHelper.thaify(spec.getSpecificationType() != null ? spec.getSpecificationType() : "System"),
                spec.getVersion() != null ? spec.getVersion() : "1.0",
                com.softinter.sicapi.util.ReportHelper.thaify(spec.getStatus() != null ? spec.getStatus() : "Draft"),
                com.softinter.sicapi.util.ReportHelper.thaify(spec.getPriority() != null ? spec.getPriority() : "Medium"),
                com.softinter.sicapi.util.ReportHelper.thaify(spec.getOwner() != null ? spec.getOwner() : "-"),
                spec.getEstimatedManday() != null ? String.valueOf(spec.getEstimatedManday()) : "0",
                com.softinter.sicapi.util.ReportHelper.thaify(projectName),
                com.softinter.sicapi.util.ReportHelper.thaify(reqTitle),
                com.softinter.sicapi.util.ReportHelper.thaify(stripHtml(spec.getDescription())),
                createdDateStr
        );

        try {
            ClassPathResource templateResource = new ClassPathResource("reports/specification_report.jrxml");
            JasperReport jasperReport;
            try (InputStream is = templateResource.getInputStream()) {
                jasperReport = JasperCompileManager.compileReport(is);
            }

            Map<String, Object> parameters = new HashMap<>();
            parameters.put("exportDate", exportDate);

            parameters.put("logoStream", com.softinter.sicapi.util.ReportHelper.getLogoInputStream());

            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(Collections.singletonList(dto));
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            JasperExportManager.exportReportToPdfStream(jasperPrint, baos);

            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate Specification PDF: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating Specification PDF: " + e.getMessage(), e);
        }
    }

    private String stripHtml(String html) {
        if (html == null || html.isBlank()) return "-";
        return html.replaceAll("<[^>]*>", " ")
                   .replaceAll("&nbsp;", " ")
                   .replaceAll("&amp;", "&")
                   .replaceAll("&lt;", "<")
                   .replaceAll("&gt;", ">")
                   .replaceAll(" +", " ")
                   .trim();
    }
}
