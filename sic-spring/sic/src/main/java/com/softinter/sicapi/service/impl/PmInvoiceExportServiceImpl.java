package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.entity.pm.PmCustomerContract;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.entity.pm.PmInvoice;
import com.softinter.sicapi.repository.pm.PmCustomerContractRepository;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmCustomerRepository;
import com.softinter.sicapi.repository.pm.PmInvoiceRepository;
import com.softinter.sicapi.service.PmInvoiceExportService;
import com.softinter.sicapi.service.ReportServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Connection;
import java.text.DecimalFormat;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PmInvoiceExportServiceImpl implements PmInvoiceExportService {

    private final PmInvoiceRepository invoiceRepository;
    private final PmCustomerRepository customerRepository;
    private final PmCustomerProjectRepository projectRepository;
    private final PmCustomerContractRepository contractRepository;
    private final DataSource dataSource;
    private final ReportServiceClient reportServiceClient;

    private static final DateTimeFormatter DISPLAY_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(ZoneId.of("Asia/Bangkok"));
    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy").withZone(ZoneId.of("Asia/Bangkok"));

    @Override
    @Transactional(readOnly = true)
    public byte[] exportInvoicePdf(UUID invoiceId, UUID businessId) {
        log.info("Generating Invoice PDF: id={}, businessId={}", invoiceId, businessId);

        PmInvoice invoice = invoiceRepository.findByIdAndBusinessIdAndIsDeleteFalse(invoiceId, businessId)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลใบแจ้งหนี้ ID: " + invoiceId));

        String customerName = "-";
        if (invoice.getCustomerId() != null) {
            customerName = customerRepository.findById(invoice.getCustomerId())
                    .map(c -> c.getCompanyNameLocal() != null ? c.getCompanyNameLocal() : c.getCompanyNameEn())
                    .orElse("-");
        }

        String projectName = "-";
        if (invoice.getProjectId() != null) {
            projectName = projectRepository.findById(invoice.getProjectId())
                    .map(PmCustomerProject::getProjectName).orElse("-");
        }

        String contractNo = "-";
        if (invoice.getContractId() != null) {
            contractNo = contractRepository.findById(invoice.getContractId())
                    .map(PmCustomerContract::getContractNo).orElse("-");
        }

        String exportDate = DISPLAY_FORMATTER.format(java.time.Instant.now());

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("invoiceId", invoiceId != null ? invoiceId.toString() : "");
        parameters.put("businessId", businessId != null ? businessId.toString() : "");
        parameters.put("exportDate", exportDate);
        parameters.put("invoiceNo", invoice.getInvoiceNo() != null ? invoice.getInvoiceNo() : "-");
        parameters.put("customerName", customerName != null ? customerName : "-");
        parameters.put("projectName", projectName);
        parameters.put("contractNo", contractNo);
        parameters.put("billingType", invoice.getBillingType() != null ? invoice.getBillingType().toString() : "MILESTONE");
        parameters.put("issueDate", invoice.getIssueDate() != null ? DATE_FORMATTER.format(invoice.getIssueDate()) : "-");
        parameters.put("dueDate", invoice.getDueDate() != null ? DATE_FORMATTER.format(invoice.getDueDate()) : "-");
        parameters.put("paymentStatus", invoice.getPaymentStatus() != null ? invoice.getPaymentStatus().toString() : "UNPAID");
        parameters.put("subtotalAmount", formatAmount(invoice.getSubtotalAmount()));
        parameters.put("vatRate", invoice.getVatRate() != null ? invoice.getVatRate().toPlainString() : "7.00");
        parameters.put("vatAmount", formatAmount(invoice.getVatAmount()));
        parameters.put("totalAmount", formatAmount(invoice.getTotalAmount()));
        parameters.put("remark", (invoice.getRemark() != null && !invoice.getRemark().isBlank())
                ? invoice.getRemark()
                : "กรุณาโอนเงินเข้าบัญชีบริษัท ซอฟต์อินเตอร์ จำกัด และส่งหลักฐานการชำระเงินเพื่อออกใบเสร็จรับเงิน");

        // 1. Try generating via external report-service
        try {
            return reportServiceClient.generateAndDownloadReport("pm_invoice_report", parameters, "pdf");
        } catch (Exception e) {
            log.warn("Failed to generate Invoice PDF via Report Service: {}. Checking fallback...", e.getMessage());
            if (!reportServiceClient.isFallbackEnabled()) {
                throw new RuntimeException("Report Service failed to generate Invoice PDF: " + e.getMessage(), e);
            }
        }

        // 2. Fallback: Local JasperReports generation
        log.info("Falling back to local JasperReports generation for invoice: id={}", invoiceId);
        try (Connection conn = dataSource.getConnection();
             InputStream is = new ClassPathResource("reports/invoice_report.jrxml").getInputStream()) {

            JasperReport jasperReport = JasperCompileManager.compileReport(is);

            parameters.put("logoStream", com.softinter.sicapi.util.ReportHelper.getLogoInputStream());

            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, conn);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            JasperExportManager.exportReportToPdfStream(jasperPrint, baos);

            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate Invoice PDF locally: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating Invoice PDF: " + e.getMessage(), e);
        }
    }

    private String formatAmount(BigDecimal amount) {
        BigDecimal value = amount != null ? amount : BigDecimal.ZERO;
        return new DecimalFormat("#,##0.00").format(value.setScale(2, RoundingMode.HALF_UP));
    }
}
