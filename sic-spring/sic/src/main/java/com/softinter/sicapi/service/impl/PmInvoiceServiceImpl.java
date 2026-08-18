package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.PmInvoiceRequest;
import com.softinter.sicapi.dto.response.PmInvoiceResponse;
import com.softinter.sicapi.entity.enums.BillingType;
import com.softinter.sicapi.entity.enums.EntityState;
import com.softinter.sicapi.entity.enums.PaymentStatus;
import com.softinter.sicapi.entity.pm.PmInvoice;
import com.softinter.sicapi.repository.pm.PmCustomerContractRepository;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmCustomerRepository;
import com.softinter.sicapi.repository.pm.PmInvoiceRepository;
import com.softinter.sicapi.service.DocumentVersionService;
import com.softinter.sicapi.service.PmInvoiceService;
import com.softinter.sicapi.util.DocumentDiffHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PmInvoiceServiceImpl implements PmInvoiceService {

    private final PmInvoiceRepository invoiceRepository;
    private final PmCustomerRepository customerRepository;
    private final PmCustomerProjectRepository projectRepository;
    private final PmCustomerContractRepository contractRepository;
    private final DocumentVersionService documentVersionService;

    @Override
    @Transactional(readOnly = true)
    public Page<PmInvoiceResponse> findAll(UUID businessId, UUID projectId, Pageable pageable) {
        Page<PmInvoice> page;
        if (projectId != null) {
            page = invoiceRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(businessId, projectId, pageable);
        } else {
            page = invoiceRepository.findByBusinessIdAndIsDeleteFalse(businessId, pageable);
        }
        return page.map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PmInvoiceResponse findById(UUID id, UUID businessId) {
        PmInvoice invoice = invoiceRepository.findByIdAndBusinessIdAndIsDeleteFalse(id, businessId)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลใบแจ้งหนี้"));
        return toResponse(invoice);
    }

    @Override
    @Transactional
    public UUID save(PmInvoiceRequest request, UUID businessId, String userId) {
        EntityState state = request.getState() != null ? EntityState.values()[request.getState()] : EntityState.DETACHED;
        PmInvoice entity;
        String diffSummary = "สร้างใบแจ้งหนี้ (Initial invoice)";

        if (state == EntityState.ADDED || request.getId() == null) {
            entity = new PmInvoice();
            entity.setBusinessId(businessId);
            entity.setCreatedBy(userId);
            entity.setCreatedDate(Instant.now());
            mapRequestToEntity(request, entity);
            if (entity.getInvoiceNo() == null || entity.getInvoiceNo().isBlank()) {
                entity.setInvoiceNo("INV-" + System.currentTimeMillis());
            }
            entity = invoiceRepository.save(entity);
        } else if (state == EntityState.MODIFIED) {
            entity = invoiceRepository.findByIdAndBusinessIdAndIsDeleteFalse(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลใบแจ้งหนี้"));
            if (request.getRowVersion() != null && !request.getRowVersion().equals(entity.getRowVersion())) {
                throw new RuntimeException("ข้อมูลถูกแก้ไขโดยผู้อื่น กรุณารีเฟรชข้อมูล");
            }

            // ✅ Auto Diff Detection
            List<String> changes = new ArrayList<>();
            DocumentDiffHelper.checkChange(changes, "เลขที่ใบแจ้งหนี้ (Invoice No)", entity.getInvoiceNo(), request.getInvoiceNo());
            DocumentDiffHelper.checkChange(changes, "สถานะการชำระ (Payment Status)", entity.getPaymentStatus(), request.getPaymentStatus());
            DocumentDiffHelper.checkChange(changes, "ยอดรวมสุทธิ (Total Amount)", entity.getTotalAmount(), request.getTotalAmount());
            DocumentDiffHelper.checkChange(changes, "วันครบกำหนด (Due Date)", entity.getDueDate(), request.getDueDate());
            diffSummary = DocumentDiffHelper.buildDiffSummary(changes, "อัปเดตใบแจ้งหนี้ " + (request.getInvoiceNo() != null ? request.getInvoiceNo() : entity.getInvoiceNo()));

            mapRequestToEntity(request, entity);
            entity.setUpdatedBy(userId);
            entity.setUpdatedDate(Instant.now());
            entity = invoiceRepository.save(entity);
        } else if (state == EntityState.DELETED) {
            delete(request.getId(), businessId, userId);
            return request.getId();
        } else {
            entity = invoiceRepository.findByIdAndBusinessIdAndIsDeleteFalse(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลใบแจ้งหนี้"));
        }

        // Snapshot data
        String snapshotJson = null;
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            snapshotJson = mapper.writeValueAsString(entity);
        } catch (Exception ignored) {}

        // ✅ Create document version
        documentVersionService.createVersion(
                "INVOICE",
                entity.getId(),
                entity.getProjectId(),
                entity.getInvoiceNo(),
                "v1.0",
                diffSummary,
                snapshotJson
        );

        return entity.getId();
    }

    @Override
    @Transactional
    public void delete(UUID id, UUID businessId, String userId) {
        PmInvoice invoice = invoiceRepository.findByIdAndBusinessIdAndIsDeleteFalse(id, businessId)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลใบแจ้งหนี้"));
        invoice.setIsDelete(true);
        invoice.setDeleteBy(userId);
        invoice.setDeleteDate(Instant.now());
        invoiceRepository.save(invoice);
    }

    private void mapRequestToEntity(PmInvoiceRequest req, PmInvoice entity) {
        entity.setInvoiceNo(req.getInvoiceNo());
        entity.setCustomerId(req.getCustomerId());
        entity.setProjectId(req.getProjectId());
        entity.setContractId(req.getContractId());
        entity.setDeliveryId(req.getDeliveryId());
        entity.setMilestoneId(req.getMilestoneId());
        entity.setBillingType(req.getBillingType() != null ? req.getBillingType() : BillingType.MILESTONE);
        entity.setIssueDate(req.getIssueDate() != null ? req.getIssueDate() : LocalDate.now());
        entity.setDueDate(req.getDueDate() != null ? req.getDueDate() : LocalDate.now().plusDays(30));

        BigDecimal subtotal = req.getSubtotalAmount() != null ? req.getSubtotalAmount() : BigDecimal.ZERO;
        BigDecimal vatRate = req.getVatRate() != null ? req.getVatRate() : new BigDecimal("7.00");
        BigDecimal vatAmount = subtotal.multiply(vatRate).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(vatAmount);

        entity.setSubtotalAmount(subtotal);
        entity.setVatRate(vatRate);
        entity.setVatAmount(vatAmount);
        entity.setTotalAmount(total);

        if (req.getPaidAmount() != null) {
            entity.setPaidAmount(req.getPaidAmount());
        }
        if (req.getPaymentStatus() != null) {
            entity.setPaymentStatus(req.getPaymentStatus());
        }
        if (req.getApprovalStatus() != null) {
            entity.setApprovalStatus(req.getApprovalStatus());
        }
        entity.setReceiptFileRef(req.getReceiptFileRef());
        entity.setRemark(req.getRemark());
    }

    private PmInvoiceResponse toResponse(PmInvoice entity) {
        PmInvoiceResponse res = new PmInvoiceResponse();
        res.setId(entity.getId());
        res.setBusinessId(entity.getBusinessId());
        res.setInvoiceNo(entity.getInvoiceNo());
        res.setCustomerId(entity.getCustomerId());
        res.setProjectId(entity.getProjectId());
        res.setContractId(entity.getContractId());
        res.setDeliveryId(entity.getDeliveryId());
        res.setMilestoneId(entity.getMilestoneId());
        res.setBillingType(entity.getBillingType());
        res.setIssueDate(entity.getIssueDate());
        res.setDueDate(entity.getDueDate());
        res.setSubtotalAmount(entity.getSubtotalAmount());
        res.setVatRate(entity.getVatRate());
        res.setVatAmount(entity.getVatAmount());
        res.setTotalAmount(entity.getTotalAmount());
        res.setPaidAmount(entity.getPaidAmount());
        res.setPaymentStatus(entity.getPaymentStatus());
        res.setApprovalStatus(entity.getApprovalStatus());
        res.setReceiptFileRef(entity.getReceiptFileRef());
        res.setRemark(entity.getRemark());

        if (entity.getCustomerId() != null) {
            customerRepository.findById(entity.getCustomerId())
                    .ifPresent(c -> res.setCustomerName(c.getCompanyNameLocal() != null ? c.getCompanyNameLocal() : c.getCompanyNameEn()));
        }
        if (entity.getProjectId() != null) {
            projectRepository.findById(entity.getProjectId())
                    .ifPresent(p -> res.setProjectName(p.getProjectName()));
        }
        if (entity.getContractId() != null) {
            contractRepository.findById(entity.getContractId())
                    .ifPresent(c -> res.setContractNo(c.getContractNo()));
        }

        res.setCreatedBy(entity.getCreatedBy());
        res.setCreatedDate(entity.getCreatedDate());
        res.setUpdatedBy(entity.getUpdatedBy());
        res.setUpdatedDate(entity.getUpdatedDate());
        res.setRowVersion(entity.getRowVersion());
        return res;
    }
}
