package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.entity.pm.PmCustomer;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.entity.pm.PmTestCase;
import com.softinter.sicapi.entity.pm.PmTestScenario;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmCustomerRepository;
import com.softinter.sicapi.repository.pm.PmTestCaseRepository;
import com.softinter.sicapi.repository.pm.PmTestScenarioRepository;
import com.softinter.sicapi.service.PmUatExportService;
import com.softinter.sicapi.service.ReportServiceClient;
import com.softinter.sicapi.util.ReportHelper;
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
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PmUatExportServiceImpl implements PmUatExportService {

    private final DataSource dataSource;
    private final PmCustomerProjectRepository projectRepository;
    private final PmCustomerRepository customerRepository;
    private final PmTestCaseRepository testCaseRepository;
    private final PmTestScenarioRepository scenarioRepository;
    private final ReportServiceClient reportServiceClient;

    private static final DateTimeFormatter DISPLAY_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(ZoneId.of("Asia/Bangkok"));

    @Override
    public byte[] exportUatReportPdf(UUID projectId, UUID businessId, String testTypeFilter, UUID scenarioId) {
        log.info("Generating UAT Report PDF: projectId={}, businessId={}, testTypeFilter={}, scenarioId={}", projectId, businessId, testTypeFilter, scenarioId);

        String exportDate = DISPLAY_FORMATTER.format(java.time.Instant.now());
        String projectName = "-";
        String customerName = "-";

        if (projectId != null) {
            PmCustomerProject project = projectRepository.findById(projectId).orElse(null);
            if (project != null) {
                projectName = project.getProjectName() != null ? project.getProjectName() : "-";
                if (project.getCustomerId() != null) {
                    PmCustomer customer = customerRepository.findById(project.getCustomerId()).orElse(null);
                    if (customer != null) {
                        customerName = customer.getCompanyNameEn() != null ? customer.getCompanyNameEn() : "-";
                    }
                }
            }
        }

        // Calculate statistics
        String filter = (testTypeFilter != null && !testTypeFilter.isBlank()) ? testTypeFilter.toUpperCase() : "UAT";
        List<PmTestCase> allCases = new java.util.ArrayList<>();
        if (projectId != null) {
            allCases.addAll(testCaseRepository.findByProjectIdAndIsDeleteFalse(projectId));
            List<PmTestScenario> scenarios = scenarioRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(businessId, projectId);
            for (PmTestScenario sc : scenarios) {
                List<PmTestCase> scCases = testCaseRepository.findByBusinessIdAndScenarioIdAndIsDeleteFalse(businessId, sc.getId());
                for (PmTestCase tc : scCases) {
                    if (allCases.stream().noneMatch(c -> c.getId().equals(tc.getId()))) {
                        allCases.add(tc);
                    }
                }
            }
        }

        List<PmTestCase> filteredCases = allCases.stream().filter(tc -> {
            if (scenarioId != null && (tc.getScenarioId() == null || !tc.getScenarioId().equals(scenarioId))) {
                return false;
            }
            String tcType = tc.getTestType();
            if ("ALL".equalsIgnoreCase(filter)) return true;
            if (tcType != null && tcType.equalsIgnoreCase(filter)) return true;
            if (tcType == null && tc.getScenarioId() != null) {
                PmTestScenario sc = scenarioRepository.findById(tc.getScenarioId()).orElse(null);
                if (sc != null && filter.equalsIgnoreCase(sc.getTestType())) return true;
            }
            return "SIT".equalsIgnoreCase(filter) && (tcType == null || "SIT".equalsIgnoreCase(tcType));
        }).toList();

        long total = filteredCases.size();
        long pass = filteredCases.stream().filter(c -> "Pass".equalsIgnoreCase(c.getTestStatus()) || "Passed".equalsIgnoreCase(c.getTestStatus())).count();
        long fail = filteredCases.stream().filter(c -> "Fail".equalsIgnoreCase(c.getTestStatus()) || "Failed".equalsIgnoreCase(c.getTestStatus())).count();
        long blocked = filteredCases.stream().filter(c -> "Blocked".equalsIgnoreCase(c.getTestStatus())).count();
        long pending = filteredCases.stream().filter(c -> c.getTestStatus() == null || "Pending".equalsIgnoreCase(c.getTestStatus())).count();
        double rate = total > 0 ? ((double) pass / total * 100.0) : 0.0;
        String passRate = (rate % 1 == 0) ? String.format("%.0f%%", rate) : String.format("%.1f%%", rate);

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("projectId", projectId != null ? projectId.toString() : "");
        parameters.put("scenarioId", scenarioId != null ? scenarioId.toString() : "");
        parameters.put("projectName", projectName);
        parameters.put("customerName", customerName);
        parameters.put("exportDate", exportDate);
        parameters.put("businessName", "SOFTINTER CO., LTD.");
        parameters.put("testTypeFilter", filter);
        parameters.put("totalCases", String.valueOf(total));
        parameters.put("passCount", String.valueOf(pass));
        parameters.put("failCount", String.valueOf(fail));
        parameters.put("blockedCount", String.valueOf(blocked));
        parameters.put("pendingCount", String.valueOf(pending));
        parameters.put("passRate", passRate);

        // 1. Try generating via external report-service
        try {
            return reportServiceClient.generateAndDownloadReport("pm_uat_report", parameters, "pdf");
        } catch (Exception e) {
            log.warn("Failed to generate UAT Report PDF via Report Service: {}. Checking fallback...", e.getMessage());
            if (!reportServiceClient.isFallbackEnabled()) {
                throw new RuntimeException("Report Service failed to generate UAT Report PDF: " + e.getMessage(), e);
            }
        }

        // 2. Fallback: Local JasperReports generation
        log.info("Falling back to local JasperReports generation for UAT Report: projectId={}", projectId);
        try (Connection conn = dataSource.getConnection();
             InputStream is = new ClassPathResource("reports/uat_report.jrxml").getInputStream()) {

            JasperReport jasperReport = JasperCompileManager.compileReport(is);
            parameters.put("logoStream", ReportHelper.getLogoInputStream());

            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, conn);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            JasperExportManager.exportReportToPdfStream(jasperPrint, baos);

            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate UAT Report PDF locally: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating UAT Report PDF: " + e.getMessage(), e);
        }
    }
}
