package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.entity.pm.PmCustomer;
import com.softinter.sicapi.entity.pm.PmCustomerContract;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.entity.pm.PmInvoice;
import com.softinter.sicapi.repository.pm.PmCustomerContractRepository;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmCustomerRepository;
import com.softinter.sicapi.repository.pm.PmInvoiceRepository;
import com.softinter.sicapi.service.PmInvoiceExportService;
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
public class PmInvoiceExportServiceImpl implements PmInvoiceExportService {

    private final PmInvoiceRepository invoiceRepository;
    private final PmCustomerRepository customerRepository;
    private final PmCustomerProjectRepository projectRepository;
    private final PmCustomerContractRepository contractRepository;

    private static final DateTimeFormatter DISPLAY_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(ZoneId.of("Asia/Bangkok"));

    private static final DecimalFormat CURRENCY_FORMAT = new DecimalFormat("#,##0.00");

    public static class InvoiceReportDto {
        private final String invoiceNo;
        private final String customerName;
        private final String projectName;
        private final String contractNo;
        private final String billingType;
        private final String issueDate;
        private final String dueDate;
        private final String subtotalAmount;
        private final String vatRate;
        private final String vatAmount;
        private final String totalAmount;
        private final String paidAmount;
        private final String paymentStatus;
        private final String remark;

        public InvoiceReportDto(String invoiceNo, String customerName, String projectName,
                                String contractNo, String billingType, String issueDate,
                                String dueDate, String subtotalAmount, String vatRate,
                                String vatAmount, String totalAmount, String paidAmount,
                                String paymentStatus, String remark) {
            this.invoiceNo = invoiceNo;
            this.customerName = customerName;
            this.projectName = projectName;
            this.contractNo = contractNo;
            this.billingType = billingType;
            this.issueDate = issueDate;
            this.dueDate = dueDate;
            this.subtotalAmount = subtotalAmount;
            this.vatRate = vatRate;
            this.vatAmount = vatAmount;
            this.totalAmount = totalAmount;
            this.paidAmount = paidAmount;
            this.paymentStatus = paymentStatus;
            this.remark = remark;
        }

        public String getInvoiceNo() { return invoiceNo; }
        public String getCustomerName() { return customerName; }
        public String getProjectName() { return projectName; }
        public String getContractNo() { return contractNo; }
        public String getBillingType() { return billingType; }
        public String getIssueDate() { return issueDate; }
        public String getDueDate() { return dueDate; }
        public String getSubtotalAmount() { return subtotalAmount; }
        public String getVatRate() { return vatRate; }
        public String getVatAmount() { return vatAmount; }
        public String getTotalAmount() { return totalAmount; }
        public String getPaidAmount() { return paidAmount; }
        public String getPaymentStatus() { return paymentStatus; }
        public String getRemark() { return remark; }
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportInvoicePdf(UUID invoiceId, UUID businessId) {
        log.info("Generating Invoice PDF: id={}, businessId={}", invoiceId, businessId);

        PmInvoice inv = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + invoiceId));

        String customerName = "-";
        if (inv.getCustomerId() != null) {
            customerName = customerRepository.findById(inv.getCustomerId())
                    .map(PmCustomer::getCompanyNameLocal)
                    .orElse("-");
        }

        String projectName = "-";
        if (inv.getProjectId() != null) {
            projectName = projectRepository.findById(inv.getProjectId())
                    .map(PmCustomerProject::getProjectName)
                    .orElse("-");
        }

        String contractNo = "-";
        if (inv.getContractId() != null) {
            contractNo = contractRepository.findById(inv.getContractId())
                    .map(PmCustomerContract::getContractNo)
                    .orElse("-");
        }

        String issueDateStr = inv.getIssueDate() != null
                ? inv.getIssueDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "-";
        String dueDateStr = inv.getDueDate() != null
                ? inv.getDueDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "-";

        String subtotalStr = inv.getSubtotalAmount() != null
                ? CURRENCY_FORMAT.format(inv.getSubtotalAmount()) : "0.00";
        String vatRateStr = inv.getVatRate() != null
                ? inv.getVatRate().toString() : "7.00";
        String vatAmtStr = inv.getVatAmount() != null
                ? CURRENCY_FORMAT.format(inv.getVatAmount()) : "0.00";
        String totalAmtStr = inv.getTotalAmount() != null
                ? CURRENCY_FORMAT.format(inv.getTotalAmount()) : "0.00";
        String paidAmtStr = inv.getPaidAmount() != null
                ? CURRENCY_FORMAT.format(inv.getPaidAmount()) : "0.00";

        String exportDate = DISPLAY_FORMATTER.format(java.time.Instant.now());

        InvoiceReportDto dto = new InvoiceReportDto(
                inv.getInvoiceNo(),
                customerName,
                projectName,
                contractNo,
                inv.getBillingType() != null ? inv.getBillingType().name() : "MILESTONE",
                issueDateStr,
                dueDateStr,
                subtotalStr,
                vatRateStr,
                vatAmtStr,
                totalAmtStr,
                paidAmtStr,
                inv.getPaymentStatus() != null ? inv.getPaymentStatus().name() : "UNPAID",
                stripHtml(inv.getRemark())
        );

        try {
            ClassPathResource templateResource = new ClassPathResource("reports/invoice_report.jrxml");
            JasperReport jasperReport;
            try (InputStream is = templateResource.getInputStream()) {
                jasperReport = JasperCompileManager.compileReport(is);
            }

            Map<String, Object> parameters = new HashMap<>();
            parameters.put("exportDate", exportDate);

            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(Collections.singletonList(dto));
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            JasperExportManager.exportReportToPdfStream(jasperPrint, baos);

            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate Invoice PDF: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating Invoice PDF: " + e.getMessage(), e);
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
