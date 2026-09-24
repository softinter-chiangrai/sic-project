package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.PmInvoiceItemRequest;
import com.softinter.sicapi.dto.request.PmInvoiceRequest;
import com.softinter.sicapi.dto.response.DocumentVersionResponse;
import com.softinter.sicapi.dto.response.PmInvoiceItemResponse;
import com.softinter.sicapi.dto.response.PmInvoiceResponse;
import com.softinter.sicapi.entity.enums.BillingType;
import com.softinter.sicapi.entity.enums.EntityState;
import com.softinter.sicapi.entity.enums.PaymentStatus;
import com.softinter.sicapi.entity.pm.PmCustomerContract;
import com.softinter.sicapi.entity.pm.PmDelivery;
import com.softinter.sicapi.entity.pm.PmInvoice;
import com.softinter.sicapi.entity.pm.PmInvoiceItem;
import com.softinter.sicapi.repository.pm.PmCustomerContractRepository;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmCustomerRepository;
import com.softinter.sicapi.repository.pm.PmDeliveryRepository;
import com.softinter.sicapi.repository.pm.PmInvoiceItemRepository;
import com.softinter.sicapi.repository.pm.PmInvoiceRepository;
import com.softinter.sicapi.service.ApprovalService;
import com.softinter.sicapi.service.DocumentVersionService;
import com.softinter.sicapi.service.PmInvoiceService;
import com.softinter.sicapi.service.AuditLogService;
import com.softinter.sicapi.util.DocumentDiffHelper;
import com.softinter.sicapi.util.JsonSnapshotHelper;
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
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PmInvoiceServiceImpl implements PmInvoiceService {

    private final PmInvoiceRepository invoiceRepository;
    private final PmInvoiceItemRepository invoiceItemRepository;
    private final PmCustomerRepository customerRepository;
    private final PmCustomerProjectRepository projectRepository;
    private final PmCustomerContractRepository contractRepository;
    private final PmDeliveryRepository deliveryRepository;
    private final DocumentVersionService documentVersionService;
    private final AuditLogService auditLogService;
    private final ApprovalService approvalService;

    @Override
    @Transactional(readOnly = true)
    public Page<PmInvoiceResponse> findAll(UUID businessId, UUID projectId, Pageable pageable) {
        return findAll(businessId, projectId, null, null, pageable);
    }

    private static final java.util.Map<String, PaymentStatus> PAYMENT_STATUS_THAI_MAP = java.util.Map.of(
            "ยังไม่จ่าย", PaymentStatus.UNPAID,
            "ค้างชำระ", PaymentStatus.UNPAID,
            "จ่ายบางส่วน", PaymentStatus.PARTIAL,
            "ชำระบางส่วน", PaymentStatus.PARTIAL,
            "จ่ายแล้ว", PaymentStatus.PAID,
            "ชำระแล้ว", PaymentStatus.PAID,
            "เกินกำหนด", PaymentStatus.OVERDUE,
            "ยกเลิก", PaymentStatus.CANCELLED
    );

    @Override
    @Transactional(readOnly = true)
    public Page<PmInvoiceResponse> findAll(UUID businessId, UUID projectId, String keyword, String paymentStatus, Pageable pageable) {
        org.springframework.data.jpa.domain.Specification<PmInvoice> spec = (root, query, cb) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
            predicates.add(cb.equal(root.get("businessId"), businessId));
            predicates.add(cb.isFalse(root.get("isDelete")));
            if (projectId != null) {
                predicates.add(cb.equal(root.get("projectId"), projectId));
            }
            if (paymentStatus != null && !paymentStatus.isBlank() && !"all".equals(paymentStatus)) {
                predicates.add(cb.equal(root.get("paymentStatus"), PaymentStatus.valueOf(paymentStatus)));
            }
            if (keyword != null && !keyword.isBlank()) {
                String rawKw = keyword.trim().toLowerCase();
                String pattern = "%" + rawKw + "%";

                jakarta.persistence.criteria.Subquery<UUID> customerSub = query.subquery(UUID.class);
                var customerRoot = customerSub.from(com.softinter.sicapi.entity.pm.PmCustomer.class);
                customerSub.select(customerRoot.get("id"));
                customerSub.where(cb.or(
                        cb.like(cb.lower(customerRoot.get("companyNameEn")), pattern),
                        cb.like(cb.lower(customerRoot.get("companyNameLocal")), pattern),
                        cb.like(cb.lower(customerRoot.get("customerCode")), pattern)
                ));

                jakarta.persistence.criteria.Subquery<UUID> projectSub = query.subquery(UUID.class);
                var projectRoot = projectSub.from(com.softinter.sicapi.entity.pm.PmCustomerProject.class);
                projectSub.select(projectRoot.get("id"));
                projectSub.where(cb.like(cb.lower(projectRoot.get("projectName")), pattern));

                List<jakarta.persistence.criteria.Predicate> orPreds = new ArrayList<>(List.of(
                        cb.like(cb.lower(root.get("invoiceNo")), pattern),
                        cb.like(cb.lower(root.get("remark")), pattern),
                        cb.like(cb.lower(root.get("paymentStatus").as(String.class)), pattern),
                        root.get("customerId").in(customerSub),
                        root.get("projectId").in(projectSub)
                ));

                // ✅ Bilingual: สถานะการชำระเงิน
                for (var entry : PAYMENT_STATUS_THAI_MAP.entrySet()) {
                    if (rawKw.contains(entry.getKey()) || entry.getKey().contains(rawKw)) {
                        orPreds.add(cb.equal(root.get("paymentStatus"), entry.getValue()));
                    }
                }

                // ✅ Bilingual: สถานะการอนุมัติ
                com.softinter.sicapi.util.ApprovalKeywordSearchHelper.addApprovalKeywordPredicates(
                        query, cb, root.get("id"), "INVOICE", rawKw, orPreds);

                predicates.add(cb.or(orPreds.toArray(new jakarta.persistence.criteria.Predicate[0])));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        org.springframework.data.domain.Page<PmInvoice> page = invoiceRepository.findAll(spec, pageable);
        java.util.Map<java.util.UUID, String> versions = documentVersionService.getLatestVersionMap(
                "INVOICE", page.getContent().stream().map(PmInvoice::getId).toList());
        return page.map(e -> {
            var dto = this.toResponse(e);
            dto.setVersion(versions.get(e.getId()));
            return dto;
        });
    }

    @Override
    @Transactional(readOnly = true)
    public PmInvoiceResponse findById(UUID id, UUID businessId) {
        PmInvoice invoice = invoiceRepository.findByIdAndBusinessIdAndIsDeleteFalse(id, businessId)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลใบแจ้งหนี้"));
        PmInvoiceResponse response = toResponse(invoice);
        response.setItems(invoiceItemRepository
                .findByInvoiceIdAndIsDeleteFalseOrderBySortOrderAsc(invoice.getId())
                .stream()
                .map(this::toItemResponse)
                .collect(Collectors.toList()));
        return response;
    }

    @Override
    @Transactional
    public UUID save(PmInvoiceRequest request, UUID businessId, String userId) {
        EntityState state = request.getState() != null ? EntityState.values()[request.getState()] : EntityState.DETACHED;
        PmInvoice entity;
        String diffSummary = "สร้างใบแจ้งหนี้ (Initial invoice)";

        // ยอดก่อนภาษี (Subtotal) คำนวณจากผลรวมของรายการสินค้า/บริการ (items) โดยอัตโนมัติ เมื่อมีรายการ
        List<PmInvoiceItemRequest> activeItems = (request.getItems() == null) ? List.of() : request.getItems().stream()
                .filter(it -> it.getState() == null || it.getState() != EntityState.DELETED.ordinal())
                .collect(Collectors.toList());
        if (!activeItems.isEmpty()) {
            BigDecimal itemsSubtotal = activeItems.stream()
                    .map(it -> it.getAmount() != null ? it.getAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            request.setSubtotalAmount(itemsSubtotal);
        }

        boolean isNew = (request.getId() == null);

        if (state == EntityState.DELETED) {
            delete(request.getId(), businessId, userId);
            return request.getId();
        } else if (isNew) {
            entity = new PmInvoice();
            entity.setBusinessId(businessId);
            entity.setCreatedBy(userId);
            entity.setCreatedDate(Instant.now());
            mapRequestToEntity(request, entity);
            if (entity.getInvoiceNo() == null || entity.getInvoiceNo().isBlank()) {
                long count = invoiceRepository.countByProjectIdAndIsDeleteFalse(entity.getProjectId()) + 1;
                entity.setInvoiceNo("INV-" + String.format("%03d", count));
            } else if (invoiceRepository.existsByBusinessIdAndProjectIdAndInvoiceNoAndIsDeleteFalse(
                    businessId, entity.getProjectId(), entity.getInvoiceNo())) {
                throw new RuntimeException("เลขที่ใบแจ้งหนี้นี้มีอยู่แล้วในโครงการนี้: " + entity.getInvoiceNo());
            }
            entity = invoiceRepository.save(entity);
            saveInvoiceItems(entity.getId(), request.getItems(), userId);
            logInvoiceAudit("CREATE_INVOICE", entity);
        } else {
            entity = invoiceRepository.findByIdAndBusinessIdAndIsDeleteFalse(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลใบแจ้งหนี้"));
            approvalService.assertNotApproved("INVOICE", entity.getId());
            if (request.getRowVersion() != null && !request.getRowVersion().equals(entity.getRowVersion())) {
                throw new RuntimeException("ข้อมูลถูกแก้ไขโดยผู้อื่น กรุณารีเฟรชข้อมูล");
            }
            String oldApprovalStatus = entity.getApprovalStatus();

            // ✅ Auto Diff Detection
            List<String> changes = new ArrayList<>();
            DocumentDiffHelper.checkChange(changes, "เลขที่ใบแจ้งหนี้ (Invoice No)", entity.getInvoiceNo(), request.getInvoiceNo());
            DocumentDiffHelper.checkChange(changes, "สถานะการชำระ (Payment Status)", entity.getPaymentStatus(), request.getPaymentStatus());
            DocumentDiffHelper.checkChange(changes, "ยอดรวมสุทธิ (Total Amount)", entity.getTotalAmount(), request.getTotalAmount());
            DocumentDiffHelper.checkChange(changes, "วันครบกำหนด (Due Date)", entity.getDueDate(), request.getDueDate());
            diffSummary = DocumentDiffHelper.buildDiffSummary(changes, "อัปเดตใบแจ้งหนี้ " + (request.getInvoiceNo() != null ? request.getInvoiceNo() : entity.getInvoiceNo()));

            mapRequestToEntity(request, entity);

            // แก้ไขเอกสารจริง (มี field เปลี่ยนแปลง) ขณะที่เคยอนุมัติแล้ว หรือกำลังรออนุมัติอยู่
            // ต้องเปลี่ยนสถานะกลับเป็น "CHANGED" และยกเลิกคำขออนุมัติที่ค้างอยู่ (ถ้ามี) เพื่อขออนุมัติใหม่
            if (!changes.isEmpty()) {
                boolean pendingInvalidated = approvalService.invalidatePendingApproval(
                        "INVOICE", entity.getId(), "เอกสารถูกแก้ไขระหว่างรอการอนุมัติ");
                if ("APPROVED".equalsIgnoreCase(oldApprovalStatus) || pendingInvalidated) {
                    entity.setApprovalStatus("CHANGED");
                }
            }

            entity.setUpdatedBy(userId);
            entity.setUpdatedDate(Instant.now());
            entity = invoiceRepository.save(entity);
            saveInvoiceItems(entity.getId(), request.getItems(), userId);
            logInvoiceAudit("UPDATE_INVOICE", entity);
        }

        // Snapshot data
        String snapshotJson = JsonSnapshotHelper.toJson(toResponse(entity));

        // ✅ Dynamic version calculation
        String targetVersion;
        if (isNew) {
            targetVersion = "v0.1";
        } else {
            String currentVer = documentVersionService.getVersions("INVOICE", entity.getId())
                    .stream().findFirst().map(DocumentVersionResponse::getVersionNo).orElse("v0.1");
            targetVersion = documentVersionService.keepVersion(currentVer);
        }

        // ✅ Create document version
        documentVersionService.createVersion(
                "INVOICE",
                entity.getId(),
                entity.getProjectId(),
                entity.getInvoiceNo(),
                targetVersion,
                diffSummary,
                snapshotJson
        );

        return entity.getId();
    }

    private void logInvoiceAudit(String action, PmInvoice entity) {
        try {
            auditLogService.log(action, "Invoice Management",
                    action.replace("_", " ") + ": " + entity.getInvoiceNo(),
                    "INVOICE", entity.getId(), null, null, "Success", null);
        } catch (Exception e) {
            log.error("ผิดพลาด audit log invoice: {}", e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void delete(UUID id, UUID businessId, String userId) {
        PmInvoice invoice = invoiceRepository.findByIdAndBusinessIdAndIsDeleteFalse(id, businessId)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลใบแจ้งหนี้"));
        approvalService.assertNotApproved("INVOICE", invoice.getId());
        invoice.setIsDelete(true);
        invoice.setDeleteBy(userId);
        invoice.setDeleteDate(Instant.now());
        invoiceRepository.save(invoice);

        // ✅ Soft Delete Document Versions
        documentVersionService.deleteVersionsByDocument("INVOICE", invoice.getId());

        logInvoiceAudit("DELETE_INVOICE", invoice);
    }

    private void saveInvoiceItems(UUID invoiceId, List<PmInvoiceItemRequest> items, String userId) {
        if (items == null) return;
        for (PmInvoiceItemRequest itemReq : items) {
            EntityState itemState = itemReq.getState() != null ? EntityState.values()[itemReq.getState()] : EntityState.DETACHED;
            boolean isItemNew = (itemReq.getId() == null);
            if (itemState == EntityState.DELETED) {
                if (itemReq.getId() != null) {
                    invoiceItemRepository.findById(itemReq.getId()).ifPresent(item -> {
                        item.setIsDelete(true);
                        item.setDeleteBy(userId);
                        item.setDeleteDate(Instant.now());
                        invoiceItemRepository.save(item);
                    });
                }
            } else if (isItemNew) {
                PmInvoiceItem item = new PmInvoiceItem();
                item.setCreatedBy(userId);
                item.setCreatedDate(Instant.now());
                item.setIsDelete(false);
                item.setInvoiceId(invoiceId);
                mapItemRequestToEntity(itemReq, item);
                invoiceItemRepository.save(item);
            } else {
                invoiceItemRepository.findById(itemReq.getId()).ifPresent(item -> {
                    mapItemRequestToEntity(itemReq, item);
                    item.setUpdatedBy(userId);
                    item.setUpdatedDate(Instant.now());
                    invoiceItemRepository.save(item);
                });
            }
        }
    }

    private void mapItemRequestToEntity(PmInvoiceItemRequest req, PmInvoiceItem entity) {
        entity.setItemName(req.getItemName());
        entity.setDescription(req.getDescription());
        entity.setAmount(req.getAmount() != null ? req.getAmount() : BigDecimal.ZERO);
        entity.setSortOrder(req.getSortOrder() != null ? req.getSortOrder() : 0);
    }

    private PmInvoiceItemResponse toItemResponse(PmInvoiceItem entity) {
        PmInvoiceItemResponse res = new PmInvoiceItemResponse();
        res.setId(entity.getId());
        res.setInvoiceId(entity.getInvoiceId());
        res.setItemName(entity.getItemName());
        res.setDescription(entity.getDescription());
        res.setAmount(entity.getAmount());
        res.setSortOrder(entity.getSortOrder());
        res.setRowVersion(entity.getRowVersion());
        return res;
    }

    private void mapRequestToEntity(PmInvoiceRequest req, PmInvoice entity) {
        entity.setInvoiceNo(req.getInvoiceNo());

        // ✅ derive projectId จาก Delivery เสมอถ้ามี deliveryId (ตัวเลือกหลักตามแผนผังความสัมพันธ์)
        // ไม่มี deliveryId ก็ยังใช้ projectId ที่เลือกตรงๆ ได้ตามปกติ (ไม่บังคับต้องมี Delivery)
        UUID effectiveProjectId = req.getProjectId();
        if (req.getDeliveryId() != null) {
            PmDelivery delivery = deliveryRepository.findById(req.getDeliveryId())
                    .orElseThrow(() -> new RuntimeException("ไม่พบ Delivery"));
            effectiveProjectId = delivery.getProjectId();
        }
        entity.setProjectId(effectiveProjectId);

        // ✅ derive customerId จาก Project เสมอเมื่อรู้ projectId (ห้าม trust req.getCustomerId() แยกต่างหาก)
        if (effectiveProjectId != null) {
            entity.setCustomerId(projectRepository.findById(effectiveProjectId)
                    .map(com.softinter.sicapi.entity.pm.PmCustomerProject::getCustomerId)
                    .orElse(req.getCustomerId()));
        } else {
            entity.setCustomerId(req.getCustomerId());
        }

        // ✅ ตรวจสอบว่า contractId (ถ้ามี) เป็นของโครงการเดียวกับ projectId ที่ derive/เลือกมา กัน mismatch
        if (req.getContractId() != null) {
            PmCustomerContract contract = contractRepository.findById(req.getContractId())
                    .orElseThrow(() -> new RuntimeException("ไม่พบสัญญา"));
            if (contract.getProjectId() != null && effectiveProjectId != null
                    && !contract.getProjectId().equals(effectiveProjectId)) {
                throw new RuntimeException("สัญญาที่เลือกไม่ได้อยู่ในโครงการเดียวกับที่เลือกไว้");
            }
        }
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
        res.setIsLocked(approvalService.isApproved("INVOICE", entity.getId()));
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
