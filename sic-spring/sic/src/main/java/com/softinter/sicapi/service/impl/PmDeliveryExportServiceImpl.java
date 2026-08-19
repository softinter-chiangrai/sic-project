package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.entity.pm.*;
import com.softinter.sicapi.repository.pm.*;
import com.softinter.sicapi.service.PmDeliveryExportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import net.sf.jasperreports.engine.design.*;
import net.sf.jasperreports.engine.type.HorizontalTextAlignEnum;
import net.sf.jasperreports.engine.type.VerticalTextAlignEnum;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
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

    public static class DeliveryReportItemDto {
        private String category;
        private String code;
        private String title;
        private String status;
        private String remark;

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
        PmDelivery delivery = deliveryRepository.findByIdAndBusinessIdAndIsDeleteFalse(deliveryId, businessId)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลการส่งมอบ ID: " + deliveryId));

        String projectName = "N/A";
        String contractNo = "N/A";
        if (delivery.getProjectId() != null) {
            projectName = projectRepository.findById(delivery.getProjectId())
                    .map(PmCustomerProject::getProjectName).orElse("N/A");
        }
        if (delivery.getContractId() != null) {
            contractNo = contractRepository.findById(delivery.getContractId())
                    .map(PmCustomerContract::getContractNo).orElse("N/A");
        }

        List<DeliveryReportItemDto> reportItems = new ArrayList<>();

        // Linked deliverable items
        List<PmDeliveryItem> items = deliveryItemRepository.findByDeliveryIdAndIsDeleteFalseOrderBySortOrderAsc(deliveryId);
        for (PmDeliveryItem it : items) {
            reportItems.add(new DeliveryReportItemDto(
                    it.getItemType(),
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
                    "CHECKLIST: " + (chk.getItemCategory() != null ? chk.getItemCategory() : "GENERAL"),
                    "-",
                    chk.getItemName(),
                    Boolean.TRUE.equals(chk.getIsChecked()) ? "CHECKED" : "PENDING",
                    chk.getRemark() != null ? chk.getRemark() : ""
            ));
        }

        if (reportItems.isEmpty()) {
            reportItems.add(new DeliveryReportItemDto("GENERAL", delivery.getDeliveryCode(), delivery.getDeliveryTitle(), delivery.getStatus(), "Delivery Package Initial"));
        }

        try {
            JasperDesign jasperDesign = new JasperDesign();
            jasperDesign.setName("DeliveryHandoverReport");
            jasperDesign.setPageWidth(595);
            jasperDesign.setPageHeight(842);
            jasperDesign.setColumnWidth(515);
            jasperDesign.setLeftMargin(40);
            jasperDesign.setRightMargin(40);
            jasperDesign.setTopMargin(40);
            jasperDesign.setBottomMargin(40);

            // Fields
            String[] fieldNames = {"category", "code", "title", "status", "remark"};
            for (String fn : fieldNames) {
                JRDesignField field = new JRDesignField();
                field.setName(fn);
                field.setValueClass(String.class);
                jasperDesign.addField(field);
            }

            // Title Band
            JRDesignBand titleBand = new JRDesignBand();
            titleBand.setHeight(140);

            JRDesignStaticText headerText = new JRDesignStaticText();
            headerText.setText("DELIVERY ACCEPTANCE & HANDOVER DOCUMENT");
            headerText.setX(0);
            headerText.setY(0);
            headerText.setWidth(515);
            headerText.setHeight(25);
            headerText.setFontSize(16f);
            headerText.setBold(true);
            headerText.setHorizontalTextAlign(HorizontalTextAlignEnum.CENTER);
            titleBand.addElement(headerText);

            JRDesignStaticText subHeaderText = new JRDesignStaticText();
            subHeaderText.setText("เอกสารส่งมอบและตรวจรับงานโครงการ (Official Handover Certificate)");
            subHeaderText.setX(0);
            subHeaderText.setY(25);
            subHeaderText.setWidth(515);
            subHeaderText.setHeight(20);
            subHeaderText.setFontSize(11f);
            subHeaderText.setHorizontalTextAlign(HorizontalTextAlignEnum.CENTER);
            titleBand.addElement(subHeaderText);

            // Project Info Details
            String infoSummary = "Delivery Code: " + delivery.getDeliveryCode() + 
                    " | Version: " + delivery.getDeliveryVersion() + 
                    " | Status: " + delivery.getStatus() + "\n" +
                    "Project: " + projectName + " | Contract: " + contractNo + "\n" +
                    "Title: " + delivery.getDeliveryTitle() + "\n" +
                    "Delivery Date: " + (delivery.getDeliveryDate() != null ? delivery.getDeliveryDate().toString() : "N/A");
            
            JRDesignStaticText infoText = new JRDesignStaticText();
            infoText.setText(infoSummary);
            infoText.setX(0);
            infoText.setY(55);
            infoText.setWidth(515);
            infoText.setHeight(75);
            infoText.setFontSize(10f);
            titleBand.addElement(infoText);

            jasperDesign.setTitle(titleBand);

            // Column Header Band
            JRDesignBand colHeaderBand = new JRDesignBand();
            colHeaderBand.setHeight(25);

            addHeaderCell(colHeaderBand, "Category", 0, 110);
            addHeaderCell(colHeaderBand, "Code", 110, 80);
            addHeaderCell(colHeaderBand, "Item Title / Description", 190, 175);
            addHeaderCell(colHeaderBand, "Status", 365, 70);
            addHeaderCell(colHeaderBand, "Remark", 435, 80);
            jasperDesign.setColumnHeader(colHeaderBand);

            // Detail Band
            JRDesignBand detailBand = new JRDesignBand();
            detailBand.setHeight(20);

            addDetailCell(detailBand, "category", 0, 110);
            addDetailCell(detailBand, "code", 110, 80);
            addDetailCell(detailBand, "title", 190, 175);
            addDetailCell(detailBand, "status", 365, 70);
            addDetailCell(detailBand, "remark", 435, 80);
            ((JRDesignSection) jasperDesign.getDetailSection()).addBand(detailBand);

            // Summary Band (Signatures & Confirmation)
            JRDesignBand summaryBand = new JRDesignBand();
            summaryBand.setHeight(130);

            String sigTextContent = "\n------------------------------------------------------------\n" +
                    "Deliverer (PM Signature): " + (delivery.getPmApprovedBy() != null ? delivery.getPmApprovedBy() : "...........................") +
                    "  Date: " + (delivery.getPmApprovedDate() != null ? delivery.getPmApprovedDate().toString() : ".....................") + "\n\n" +
                    "Accepted by (Client Signature): " + (delivery.getCustomerSignedBy() != null ? delivery.getCustomerSignedBy() : "...........................") +
                    "  Date: " + (delivery.getCustomerSignedDate() != null ? delivery.getCustomerSignedDate().toString() : ".....................") + "\n" +
                    "(Digital Certified Handover via SIC Enterprise Platform)";

            JRDesignStaticText signatureBlock = new JRDesignStaticText();
            signatureBlock.setText(sigTextContent);
            signatureBlock.setX(0);
            signatureBlock.setY(10);
            signatureBlock.setWidth(515);
            signatureBlock.setHeight(110);
            signatureBlock.setFontSize(10f);
            summaryBand.addElement(signatureBlock);

            jasperDesign.setSummary(summaryBand);

            JasperReport jasperReport = JasperCompileManager.compileReport(jasperDesign);
            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(reportItems);
            Map<String, Object> parameters = new HashMap<>();

            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            JasperExportManager.exportReportToPdfStream(jasperPrint, baos);
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate JasperReports PDF for delivery: {}", deliveryId, e);
            throw new RuntimeException("Error generating Delivery PDF Report: " + e.getMessage(), e);
        }
    }

    private void addHeaderCell(JRDesignBand band, String text, int x, int width) {
        JRDesignStaticText header = new JRDesignStaticText();
        header.setText(text);
        header.setX(x);
        header.setY(0);
        header.setWidth(width);
        header.setHeight(20);
        header.setFontSize(10f);
        header.setBold(true);
        header.setVerticalTextAlign(VerticalTextAlignEnum.MIDDLE);
        band.addElement(header);
    }

    private void addDetailCell(JRDesignBand band, String fieldName, int x, int width) {
        JRDesignTextField textField = new JRDesignTextField();
        JRDesignExpression expression = new JRDesignExpression();
        expression.setText("$F{" + fieldName + "}");
        textField.setExpression(expression);
        textField.setX(x);
        textField.setY(0);
        textField.setWidth(width);
        textField.setHeight(20);
        textField.setFontSize(9f);
        textField.setVerticalTextAlign(VerticalTextAlignEnum.MIDDLE);
        band.addElement(textField);
    }
}
