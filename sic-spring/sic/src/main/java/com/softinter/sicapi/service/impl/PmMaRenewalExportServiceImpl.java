package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.entity.pm.PmCustomer;
import com.softinter.sicapi.entity.pm.PmCustomerContract;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.entity.pm.PmMaRenewal;
import com.softinter.sicapi.repository.pm.PmCustomerContractRepository;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmCustomerRepository;
import com.softinter.sicapi.repository.pm.PmMaRenewalRepository;
import com.softinter.sicapi.service.PmMaRenewalExportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.text.DecimalFormat;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PmMaRenewalExportServiceImpl implements PmMaRenewalExportService {

    private final PmMaRenewalRepository renewalRepository;
    private final PmCustomerContractRepository contractRepository;
    private final PmCustomerRepository customerRepository;
    private final PmCustomerProjectRepository projectRepository;

    private static final DateTimeFormatter DISPLAY_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(ZoneId.of("Asia/Bangkok"));

    private static final DateTimeFormatter DATE_ONLY_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy").withZone(ZoneId.of("Asia/Bangkok"));

    private static final DecimalFormat CURRENCY_FORMAT = new DecimalFormat("#,##0.00");

    public static class RenewalReportDto {
        private final String renewalNo;
        private final String contractNo;
        private final String customerName;
        private final String projectName;
        private final String currentEndDate;
        private final String newStartDate;
        private final String newEndDate;
        private final String proposedAmount;
        private final String status;
        private final String remark;

        public RenewalReportDto(String renewalNo, String contractNo, String customerName,
                                String projectName, String currentEndDate, String newStartDate,
                                String newEndDate, String proposedAmount, String status, String remark) {
            this.renewalNo = renewalNo;
            this.contractNo = contractNo;
            this.customerName = customerName;
            this.projectName = projectName;
            this.currentEndDate = currentEndDate;
            this.newStartDate = newStartDate;
            this.newEndDate = newEndDate;
            this.proposedAmount = proposedAmount;
            this.status = status;
            this.remark = remark;
        }

        public String getRenewalNo() { return renewalNo; }
        public String getContractNo() { return contractNo; }
        public String getCustomerName() { return customerName; }
        public String getProjectName() { return projectName; }
        public String getCurrentEndDate() { return currentEndDate; }
        public String getNewStartDate() { return newStartDate; }
        public String getNewEndDate() { return newEndDate; }
        public String getProposedAmount() { return proposedAmount; }
        public String getStatus() { return status; }
        public String getRemark() { return remark; }
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportRenewalPdf(UUID renewalId, UUID businessId) {
        log.info("Generating Renewal PDF: id={}, businessId={}", renewalId, businessId);

        PmMaRenewal renewal = renewalRepository.findById(renewalId)
                .orElseThrow(() -> new RuntimeException("Renewal proposal not found: " + renewalId));

        String contractNo = "-";
        if (renewal.getContractId() != null) {
            contractNo = contractRepository.findById(renewal.getContractId())
                    .map(PmCustomerContract::getContractNo)
                    .orElse("-");
        }

        String customerName = "-";
        if (renewal.getCustomerId() != null) {
            customerName = customerRepository.findById(renewal.getCustomerId())
                    .map(PmCustomer::getCompanyNameLocal)
                    .orElse("-");
        }

        String projectName = "-";
        if (renewal.getProjectId() != null) {
            projectName = projectRepository.findById(renewal.getProjectId())
                    .map(PmCustomerProject::getProjectName)
                    .orElse("-");
        }

        String currentEndDateStr = renewal.getCurrentEndDate() != null
                ? renewal.getCurrentEndDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "-";
        String newStartDateStr = renewal.getNewStartDate() != null
                ? renewal.getNewStartDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "-";
        String newEndDateStr = renewal.getNewEndDate() != null
                ? renewal.getNewEndDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "-";

        String proposedAmtStr = renewal.getProposedAmount() != null
                ? CURRENCY_FORMAT.format(renewal.getProposedAmount()) : "0.00";

        String exportDate = DISPLAY_FORMATTER.format(java.time.Instant.now());

        RenewalReportDto dto = new RenewalReportDto(
                renewal.getRenewalNo(),
                contractNo,
                com.softinter.sicapi.util.ReportHelper.thaify(customerName),
                com.softinter.sicapi.util.ReportHelper.thaify(projectName),
                currentEndDateStr,
                newStartDateStr,
                newEndDateStr,
                proposedAmtStr,
                com.softinter.sicapi.util.ReportHelper.thaify(renewal.getStatus() != null ? renewal.getStatus().name() : "DRAFT"),
                com.softinter.sicapi.util.ReportHelper.thaify(stripHtml(renewal.getRemark()))
        );

        try {
            ClassPathResource templateResource = new ClassPathResource("reports/renewal_report.jrxml");
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
            log.error("Failed to generate Renewal PDF: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating Renewal PDF: " + e.getMessage(), e);
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
