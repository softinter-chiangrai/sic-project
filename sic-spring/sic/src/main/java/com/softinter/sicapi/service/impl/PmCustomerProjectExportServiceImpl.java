package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.entity.pm.PmCustomer;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmCustomerRepository;
import com.softinter.sicapi.service.PmCustomerProjectExportService;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class PmCustomerProjectExportServiceImpl implements PmCustomerProjectExportService {

    private final PmCustomerProjectRepository projectRepository;
    private final PmCustomerRepository customerRepository;

    private static final DateTimeFormatter DISPLAY_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
                             .withZone(ZoneId.of("Asia/Bangkok"));

    private static final DateTimeFormatter DATE_ONLY_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy")
                             .withZone(ZoneId.of("Asia/Bangkok"));

    public static class ProjectReportDto {
        private final String projectCode;
        private final String projectName;
        private final String customerName;
        private final String status;
        private final String priority;
        private final String startDate;
        private final String plannedEndDate;
        private final String actualEndDate;
        private final String budgetManday;
        private final String usedManday;
        private final String progress;
        private final String description;
        private final String createdDate;

        public ProjectReportDto(String projectCode, String projectName, String customerName,
                                String status, String priority, String startDate,
                                String plannedEndDate, String actualEndDate, String budgetManday,
                                String usedManday, String progress, String description,
                                String createdDate) {
            this.projectCode = projectCode;
            this.projectName = projectName;
            this.customerName = customerName;
            this.status = status;
            this.priority = priority;
            this.startDate = startDate;
            this.plannedEndDate = plannedEndDate;
            this.actualEndDate = actualEndDate;
            this.budgetManday = budgetManday;
            this.usedManday = usedManday;
            this.progress = progress;
            this.description = description;
            this.createdDate = createdDate;
        }

        public String getProjectCode() { return projectCode; }
        public String getProjectName() { return projectName; }
        public String getCustomerName() { return customerName; }
        public String getStatus() { return status; }
        public String getPriority() { return priority; }
        public String getStartDate() { return startDate; }
        public String getPlannedEndDate() { return plannedEndDate; }
        public String getActualEndDate() { return actualEndDate; }
        public String getBudgetManday() { return budgetManday; }
        public String getUsedManday() { return usedManday; }
        public String getProgress() { return progress; }
        public String getDescription() { return description; }
        public String getCreatedDate() { return createdDate; }
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportProjectPdf(UUID id, UUID businessId) {
        log.info("Generating Project PDF: id={}, businessId={}", id, businessId);

        PmCustomerProject project = projectRepository.findByIdAndBusinessIdAndIsDeleteFalse(id, businessId)
                .orElseGet(() -> projectRepository.findByIdAndBusinessId(id, businessId)
                        .orElseThrow(() -> new RuntimeException("Project not found: " + id)));

        String customerName = "-";
        if (project.getCustomerId() != null) {
            customerName = customerRepository.findById(project.getCustomerId())
                    .map(c -> {
                        String name = c.getCompanyNameLocal();
                        if (name == null || name.isBlank()) {
                            name = c.getCompanyNameEn();
                        }
                        return name != null ? name : "-";
                    })
                    .orElse("-");
        }

        String startDateStr = project.getStartDate() != null
                ? DATE_ONLY_FORMATTER.format(project.getStartDate()) : "-";
        String plannedEndDateStr = project.getPlannedEndDate() != null
                ? DATE_ONLY_FORMATTER.format(project.getPlannedEndDate()) : "-";
        String actualEndDateStr = project.getActualEndDate() != null
                ? DATE_ONLY_FORMATTER.format(project.getActualEndDate()) : "-";
        String createdDateStr = project.getCreatedDate() != null
                ? DISPLAY_FORMATTER.format(project.getCreatedDate()) : "-";

        int budget = project.getBudgetManday() != null ? project.getBudgetManday() : 0;
        int used = project.getUsedManday() != null ? project.getUsedManday() : 0;
        String progressStr = budget > 0 ? (Math.round((double) used / budget * 100)) + "%" : "0%";

        String exportDate = DISPLAY_FORMATTER.format(java.time.Instant.now());

        ProjectReportDto dto = new ProjectReportDto(
                project.getProjectCode(),
                com.softinter.sicapi.util.ReportHelper.thaify(project.getProjectName()),
                com.softinter.sicapi.util.ReportHelper.thaify(customerName),
                com.softinter.sicapi.util.ReportHelper.thaify(project.getStatus()),
                com.softinter.sicapi.util.ReportHelper.thaify(project.getPriority()),
                startDateStr,
                plannedEndDateStr,
                actualEndDateStr,
                String.valueOf(budget),
                String.valueOf(used),
                progressStr,
                com.softinter.sicapi.util.ReportHelper.thaify(stripHtml(project.getDescription())),
                createdDateStr
        );

        List<ProjectReportDto> dataList = Collections.singletonList(dto);

        try {
            ClassPathResource templateResource = new ClassPathResource("reports/project_report.jrxml");
            JasperReport jasperReport;
            try (InputStream is = templateResource.getInputStream()) {
                jasperReport = JasperCompileManager.compileReport(is);
            }

            Map<String, Object> parameters = new HashMap<>();
            parameters.put("exportDate", exportDate);
            parameters.put("logoStream", com.softinter.sicapi.util.ReportHelper.getLogoInputStream());

            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(dataList);
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            JasperExportManager.exportReportToPdfStream(jasperPrint, baos);

            log.info("Project PDF export success: id={}, size={} bytes", id, baos.size());
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate Project PDF for id={}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Error generating Project PDF: " + e.getMessage(), e);
        }
    }

    private String stripHtml(String html) {
        if (html == null || html.isBlank()) return "-";
        return html.replaceAll("<[^>]*>", " ")
                   .replaceAll("&nbsp;", " ")
                   .replaceAll("&amp;", "&")
                   .replaceAll("&lt;", "<")
                   .replaceAll("&gt;", ">")
                   .replaceAll("&quot;", "\"")
                   .replaceAll("&#39;", "'")
                   .replaceAll(" +", " ")
                   .trim();
    }
}
