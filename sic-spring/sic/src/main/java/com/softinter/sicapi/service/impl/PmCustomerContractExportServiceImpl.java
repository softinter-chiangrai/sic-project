package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.entity.pm.PmCustomer;
import com.softinter.sicapi.entity.pm.PmCustomerContract;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.repository.pm.PmCustomerContractRepository;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmCustomerRepository;
import com.softinter.sicapi.service.PmCustomerContractExportService;
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
public class PmCustomerContractExportServiceImpl implements PmCustomerContractExportService {

    private final PmCustomerContractRepository contractRepository;
    private final PmCustomerRepository customerRepository;
    private final PmCustomerProjectRepository projectRepository;

    private static final DateTimeFormatter DISPLAY_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(ZoneId.of("Asia/Bangkok"));

    private static final DateTimeFormatter DATE_ONLY_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy").withZone(ZoneId.of("Asia/Bangkok"));

    private static final DecimalFormat CURRENCY_FORMAT = new DecimalFormat("#,##0.00");

    public static class ContractReportDto {
        private final String contractNo;
        private final String contractType;
        private final String customerName;
        private final String projectName;
        private final String contractValue;
        private final String signStatus;
        private final String startDate;
        private final String endDate;
        private final String paymentTerms;
        private final String scopeSummary;
        private final String renewalStatus;

        public ContractReportDto(String contractNo, String contractType, String customerName,
                                 String projectName, String contractValue, String signStatus,
                                 String startDate, String endDate, String paymentTerms,
                                 String scopeSummary, String renewalStatus) {
            this.contractNo = contractNo;
            this.contractType = contractType;
            this.customerName = customerName;
            this.projectName = projectName;
            this.contractValue = contractValue;
            this.signStatus = signStatus;
            this.startDate = startDate;
            this.endDate = endDate;
            this.paymentTerms = paymentTerms;
            this.scopeSummary = scopeSummary;
            this.renewalStatus = renewalStatus;
        }

        public String getContractNo() { return contractNo; }
        public String getContractType() { return contractType; }
        public String getCustomerName() { return customerName; }
        public String getProjectName() { return projectName; }
        public String getContractValue() { return contractValue; }
        public String getSignStatus() { return signStatus; }
        public String getStartDate() { return startDate; }
        public String getEndDate() { return endDate; }
        public String getPaymentTerms() { return paymentTerms; }
        public String getScopeSummary() { return scopeSummary; }
        public String getRenewalStatus() { return renewalStatus; }
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportContractPdf(UUID contractId, UUID businessId) {
        log.info("Generating Contract PDF: id={}, businessId={}", contractId, businessId);

        PmCustomerContract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found: " + contractId));

        String customerName = "-";
        if (contract.getCustomerId() != null) {
            customerName = customerRepository.findById(contract.getCustomerId())
                    .map(PmCustomer::getCompanyNameLocal)
                    .orElse("-");
        }

        String projectName = "-";
        if (contract.getProjectId() != null) {
            projectName = projectRepository.findById(contract.getProjectId())
                    .map(PmCustomerProject::getProjectName)
                    .orElse("-");
        }

        String startDateStr = contract.getStartDate() != null
                ? DATE_ONLY_FORMATTER.format(contract.getStartDate()) : "-";
        String endDateStr = contract.getEndDate() != null
                ? DATE_ONLY_FORMATTER.format(contract.getEndDate()) : "-";
        String contractValStr = contract.getContractValue() != null
                ? CURRENCY_FORMAT.format(contract.getContractValue()) : "0.00";

        String exportDate = DISPLAY_FORMATTER.format(java.time.Instant.now());

        ContractReportDto dto = new ContractReportDto(
                contract.getContractNo(),
                com.softinter.sicapi.util.ReportHelper.thaify(contract.getContractType() != null ? contract.getContractType() : "General"),
                com.softinter.sicapi.util.ReportHelper.thaify(customerName),
                com.softinter.sicapi.util.ReportHelper.thaify(projectName),
                contractValStr,
                com.softinter.sicapi.util.ReportHelper.thaify(contract.getSignStatus() != null ? contract.getSignStatus() : "-"),
                startDateStr,
                endDateStr,
                com.softinter.sicapi.util.ReportHelper.thaify(stripHtml(contract.getPaymentTerms())),
                com.softinter.sicapi.util.ReportHelper.thaify(stripHtml(contract.getScopeSummary())),
                com.softinter.sicapi.util.ReportHelper.thaify(contract.getRenewalStatus() != null ? contract.getRenewalStatus() : "NONE")
        );

        try {
            ClassPathResource templateResource = new ClassPathResource("reports/contract_report.jrxml");
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
            log.error("Failed to generate Contract PDF: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating Contract PDF: " + e.getMessage(), e);
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
