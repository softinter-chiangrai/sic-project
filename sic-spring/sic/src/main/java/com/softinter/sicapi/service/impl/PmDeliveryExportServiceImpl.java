package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.entity.pm.PmCustomerContract;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.entity.pm.PmDelivery;
import com.softinter.sicapi.repository.pm.PmCustomerContractRepository;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmDeliveryRepository;
import com.softinter.sicapi.service.PmDeliveryExportService;
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
import java.sql.Connection;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PmDeliveryExportServiceImpl implements PmDeliveryExportService {

    private final PmDeliveryRepository deliveryRepository;
    private final PmCustomerProjectRepository projectRepository;
    private final PmCustomerContractRepository contractRepository;
    private final DataSource dataSource;
    private final ReportServiceClient reportServiceClient;

    private static final DateTimeFormatter DISPLAY_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(ZoneId.of("Asia/Bangkok"));

    @Override
    @Transactional(readOnly = true)
    public byte[] exportDeliveryHandoverPdf(UUID deliveryId, UUID businessId) {
        log.info("Generating Delivery PDF: id={}, businessId={}", deliveryId, businessId);

        PmDelivery delivery = deliveryRepository.findByIdAndBusinessIdAndIsDeleteFalse(deliveryId, businessId)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลการส่งมอบ ID: " + deliveryId));

        String projectName = "-";
        String contractNo = "-";
        if (delivery.getProjectId() != null) {
            projectName = projectRepository.findById(delivery.getProjectId())
                    .map(PmCustomerProject::getProjectName).orElse("-");
        }
        if (delivery.getContractId() != null) {
            contractNo = contractRepository.findById(delivery.getContractId())
                    .map(PmCustomerContract::getContractNo).orElse("-");
        }

        String deliveryDateStr = delivery.getDeliveryDate() != null
                ? delivery.getDeliveryDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "-";
        String exportDate = DISPLAY_FORMATTER.format(java.time.Instant.now());

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("deliveryId", deliveryId != null ? deliveryId.toString() : "");
        parameters.put("businessId", businessId != null ? businessId.toString() : "");
        parameters.put("exportDate", exportDate);
        parameters.put("deliveryCode", delivery.getDeliveryCode() != null ? delivery.getDeliveryCode() : "-");
        parameters.put("deliveryTitle", delivery.getDeliveryTitle() != null ? delivery.getDeliveryTitle() : "-");
        parameters.put("projectName", projectName);
        parameters.put("contractNo", contractNo);
        parameters.put("deliveryType", delivery.getDeliveryType() != null ? delivery.getDeliveryType() : "FINAL");
        parameters.put("deliveryVersion", delivery.getDeliveryVersion() != null ? delivery.getDeliveryVersion() : "1.0");
        parameters.put("deliveryDate", deliveryDateStr);
        parameters.put("status", delivery.getStatus() != null ? delivery.getStatus() : "-");
        parameters.put("deliverySummary", stripHtml(delivery.getDeliverySummary()));

        // 1. Try generating via external report-service
        try {
            return reportServiceClient.generateAndDownloadReport("pm_delivery_report", parameters, "pdf");
        } catch (Exception e) {
            log.warn("Failed to generate Delivery PDF via Report Service: {}. Checking fallback...", e.getMessage());
            if (!reportServiceClient.isFallbackEnabled()) {
                throw new RuntimeException("Report Service failed to generate Delivery PDF: " + e.getMessage(), e);
            }
        }

        // 2. Fallback: Local JasperReports generation
        log.info("Falling back to local JasperReports generation for delivery: id={}", deliveryId);
        try (Connection conn = dataSource.getConnection();
             InputStream is = new ClassPathResource("reports/delivery_report.jrxml").getInputStream()) {

            JasperReport jasperReport = JasperCompileManager.compileReport(is);

            parameters.put("logoStream", com.softinter.sicapi.util.ReportHelper.getLogoInputStream());

            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, conn);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            JasperExportManager.exportReportToPdfStream(jasperPrint, baos);

            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate Delivery PDF locally: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating Delivery PDF: " + e.getMessage(), e);
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

