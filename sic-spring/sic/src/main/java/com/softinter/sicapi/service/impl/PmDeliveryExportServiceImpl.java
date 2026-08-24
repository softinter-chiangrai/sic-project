package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.entity.pm.*;
import com.softinter.sicapi.repository.pm.*;
import com.softinter.sicapi.service.PmDeliveryExportService;
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
public class PmDeliveryExportServiceImpl implements PmDeliveryExportService {

    private final PmDeliveryRepository deliveryRepository;
    private final PmDeliveryChecklistRepository checklistRepository;
    private final PmDeliveryItemRepository deliveryItemRepository;
    private final PmCustomerProjectRepository projectRepository;
    private final PmCustomerContractRepository contractRepository;

    private static final DateTimeFormatter DISPLAY_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(ZoneId.of("Asia/Bangkok"));

    public static class DeliveryReportItemDto {
        private final String category;
        private final String code;
        private final String title;
        private final String status;
        private final String remark;

        public DeliveryReportItemDto(String category, String code, String title, String status, String remark) {
            this.category = category;
            this.code = code;
            this.title = title;
            this.status = status;
            this.remark = remark;
        }

        public String getCategory() { return category; }
        public String getCode() { return code; }
        public String getTitle() { return title; }
        public String getStatus() { return status; }
        public String getRemark() { return remark; }
    }

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

        List<DeliveryReportItemDto> reportItems = new ArrayList<>();

        // Linked deliverable items
        List<PmDeliveryItem> items = deliveryItemRepository.findByDeliveryIdAndIsDeleteFalseOrderBySortOrderAsc(deliveryId);
        for (PmDeliveryItem it : items) {
            reportItems.add(new DeliveryReportItemDto(
                    "DELIVERABLE (" + (it.getItemType() != null ? it.getItemType() : "ITEM") + ")",
                    it.getItemCode() != null ? it.getItemCode() : "-",
                    it.getItemTitle() != null ? it.getItemTitle() : "-",
                    it.getItemStatus() != null ? it.getItemStatus() : "DONE",
                    it.getRemark() != null ? it.getRemark() : ""
            ));
        }

        // Checklists
        List<PmDeliveryChecklist> checklists = checklistRepository.findByDeliveryIdAndIsDeleteFalseOrderBySortOrderAsc(deliveryId);
        for (PmDeliveryChecklist chk : checklists) {
            reportItems.add(new DeliveryReportItemDto(
                    "CHECKLIST (" + (chk.getItemCategory() != null ? chk.getItemCategory() : "GENERAL") + ")",
                    "-",
                    chk.getItemName(),
                    Boolean.TRUE.equals(chk.getIsChecked()) ? "PASS" : "PENDING",
                    chk.getRemark() != null ? chk.getRemark() : ""
            ));
        }

        if (reportItems.isEmpty()) {
            reportItems.add(new DeliveryReportItemDto("GENERAL", delivery.getDeliveryCode(), delivery.getDeliveryTitle(), delivery.getStatus(), "Delivery Package Initial"));
        }

        String deliveryDateStr = delivery.getDeliveryDate() != null
                ? delivery.getDeliveryDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "-";
        String exportDate = DISPLAY_FORMATTER.format(java.time.Instant.now());

        try {
            ClassPathResource templateResource = new ClassPathResource("reports/delivery_report.jrxml");
            JasperReport jasperReport;
            try (InputStream is = templateResource.getInputStream()) {
                jasperReport = JasperCompileManager.compileReport(is);
            }

            Map<String, Object> parameters = new HashMap<>();
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

            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(reportItems);
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            JasperExportManager.exportReportToPdfStream(jasperPrint, baos);

            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate Delivery PDF: {}", e.getMessage(), e);
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
