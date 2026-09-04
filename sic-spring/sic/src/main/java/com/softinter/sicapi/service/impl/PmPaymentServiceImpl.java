package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.PmPaymentRequest;
import com.softinter.sicapi.dto.response.PmPaymentResponse;
import com.softinter.sicapi.entity.enums.EntityState;
import com.softinter.sicapi.entity.enums.PaymentMethod;
import com.softinter.sicapi.entity.enums.PaymentStatus;
import com.softinter.sicapi.entity.pm.PmInvoice;
import com.softinter.sicapi.entity.pm.PmPayment;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmCustomerRepository;
import com.softinter.sicapi.repository.pm.PmInvoiceRepository;
import com.softinter.sicapi.repository.pm.PmPaymentRepository;
import com.softinter.sicapi.service.PmPaymentService;
import com.softinter.sicapi.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PmPaymentServiceImpl implements PmPaymentService {

    private final PmPaymentRepository paymentRepository;
    private final PmInvoiceRepository invoiceRepository;
    private final PmCustomerRepository customerRepository;
    private final PmCustomerProjectRepository projectRepository;
    private final AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public Page<PmPaymentResponse> findAll(UUID businessId, UUID invoiceId, Pageable pageable) {
        Page<PmPayment> page;
        if (invoiceId != null) {
            page = paymentRepository.findByBusinessIdAndInvoiceIdAndIsDeleteFalse(businessId, invoiceId, pageable);
        } else {
            page = paymentRepository.findByBusinessIdAndIsDeleteFalse(businessId, pageable);
        }
        return page.map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PmPaymentResponse findById(UUID id, UUID businessId) {
        PmPayment payment = paymentRepository.findByIdAndBusinessIdAndIsDeleteFalse(id, businessId)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลรายการชำระเงิน"));
        return toResponse(payment);
    }

    @Override
    @Transactional
    public UUID save(PmPaymentRequest request, UUID businessId, String userId) {
        EntityState state = request.getState() != null ? EntityState.values()[request.getState()] : EntityState.DETACHED;
        PmPayment entity;
        boolean isNew = (request.getId() == null);

        if (state == EntityState.DELETED) {
            delete(request.getId(), businessId, userId);
            return request.getId();
        } else if (isNew) {
            entity = new PmPayment();
            entity.setBusinessId(businessId);
            entity.setCreatedBy(userId);
            entity.setCreatedDate(Instant.now());
            mapRequestToEntity(request, entity);
            if (entity.getPaymentNo() == null || entity.getPaymentNo().isBlank()) {
                entity.setPaymentNo("PAY-" + System.currentTimeMillis());
            }
            entity = paymentRepository.save(entity);

            try {
                auditLogService.log("CREATE_PAYMENT", "Payment Management",
                        "สร้างรายการชำระเงิน: " + entity.getPaymentNo() + " (ยอดเงิน: " + entity.getAmount() + ")",
                        "PAYMENT", entity.getId(), null, null, "Success", null);
            } catch (Exception e) {
                log.error("ผิดพลาด audit log CREATE_PAYMENT: {}", e.getMessage(), e);
            }
        } else {
            entity = paymentRepository.findByIdAndBusinessIdAndIsDeleteFalse(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลรายการชำระเงิน"));
            if (request.getRowVersion() != null && !request.getRowVersion().equals(entity.getRowVersion())) {
                throw new RuntimeException("ข้อมูลถูกแก้ไขโดยผู้อื่น กรุณารีเฟรชข้อมูล");
            }
            mapRequestToEntity(request, entity);
            entity.setUpdatedBy(userId);
            entity.setUpdatedDate(Instant.now());
            entity = paymentRepository.save(entity);

            try {
                auditLogService.log("UPDATE_PAYMENT", "Payment Management",
                        "แก้ไขรายการชำระเงิน: " + entity.getPaymentNo() + " (ยอดเงิน: " + entity.getAmount() + ")",
                        "PAYMENT", entity.getId(), null, null, "Success", null);
            } catch (Exception e) {
                log.error("ผิดพลาด audit log UPDATE_PAYMENT: {}", e.getMessage(), e);
            }
        }

        recalculateInvoiceStatus(entity.getInvoiceId(), businessId, userId);

        return entity.getId();
    }

    @Override
    @Transactional
    public void delete(UUID id, UUID businessId, String userId) {
        PmPayment payment = paymentRepository.findByIdAndBusinessIdAndIsDeleteFalse(id, businessId)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลรายการชำระเงิน"));
        payment.setIsDelete(true);
        payment.setDeleteBy(userId);
        payment.setDeleteDate(Instant.now());
        paymentRepository.save(payment);

        try {
            auditLogService.log("DELETE_PAYMENT", "Payment Management",
                    "ลบรายการชำระเงิน: " + payment.getPaymentNo(),
                    "PAYMENT", payment.getId(), null, null, "Success", null);
        } catch (Exception e) {
            log.error("ผิดพลาด audit log DELETE_PAYMENT: {}", e.getMessage(), e);
        }

        recalculateInvoiceStatus(payment.getInvoiceId(), businessId, userId);
    }

    private void recalculateInvoiceStatus(UUID invoiceId, UUID businessId, String userId) {
        invoiceRepository.findByIdAndBusinessIdAndIsDeleteFalse(invoiceId, businessId).ifPresent(invoice -> {
            List<PmPayment> payments = paymentRepository.findByBusinessIdAndInvoiceIdAndIsDeleteFalse(businessId, invoiceId);
            BigDecimal totalPaid = payments.stream()
                    .filter(p -> p.getPaymentStatus() == PaymentStatus.PAID)
                    .map(PmPayment::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            invoice.setPaidAmount(totalPaid);
            if (totalPaid.compareTo(invoice.getTotalAmount()) >= 0 && invoice.getTotalAmount().compareTo(BigDecimal.ZERO) > 0) {
                invoice.setPaymentStatus(PaymentStatus.PAID);
            } else if (totalPaid.compareTo(BigDecimal.ZERO) > 0) {
                invoice.setPaymentStatus(PaymentStatus.PARTIAL);
            } else {
                invoice.setPaymentStatus(PaymentStatus.UNPAID);
            }
            invoice.setUpdatedBy(userId);
            invoice.setUpdatedDate(Instant.now());
            invoiceRepository.save(invoice);
        });
    }

    private void mapRequestToEntity(PmPaymentRequest req, PmPayment entity) {
        entity.setPaymentNo(req.getPaymentNo());
        entity.setInvoiceId(req.getInvoiceId());
        entity.setPaymentDate(req.getPaymentDate() != null ? req.getPaymentDate() : Instant.now());
        entity.setPaymentMethod(req.getPaymentMethod() != null ? req.getPaymentMethod() : PaymentMethod.BANK_TRANSFER);
        entity.setAmount(req.getAmount() != null ? req.getAmount() : BigDecimal.ZERO);
        entity.setReferenceNo(req.getReferenceNo());
        entity.setBankName(req.getBankName());
        entity.setReceiptFile(req.getReceiptFile());
        entity.setPaymentStatus(req.getPaymentStatus() != null ? req.getPaymentStatus() : PaymentStatus.PAID);
        entity.setNotes(req.getNotes());
    }

    private PmPaymentResponse toResponse(PmPayment entity) {
        PmPaymentResponse res = new PmPaymentResponse();
        res.setId(entity.getId());
        res.setBusinessId(entity.getBusinessId());
        res.setPaymentNo(entity.getPaymentNo());
        res.setInvoiceId(entity.getInvoiceId());
        res.setPaymentDate(entity.getPaymentDate());
        res.setPaymentMethod(entity.getPaymentMethod());
        res.setAmount(entity.getAmount());
        res.setReferenceNo(entity.getReferenceNo());
        res.setBankName(entity.getBankName());
        res.setReceiptFile(entity.getReceiptFile());
        res.setPaymentStatus(entity.getPaymentStatus());
        res.setNotes(entity.getNotes());

        if (entity.getInvoiceId() != null) {
            invoiceRepository.findById(entity.getInvoiceId()).ifPresent(inv -> {
                res.setInvoiceNo(inv.getInvoiceNo());
                res.setCustomerId(inv.getCustomerId());
                res.setProjectId(inv.getProjectId());

                if (inv.getCustomerId() != null) {
                    customerRepository.findById(inv.getCustomerId())
                            .ifPresent(c -> res.setCustomerName(c.getCompanyNameLocal() != null ? c.getCompanyNameLocal() : c.getCompanyNameEn()));
                }
                if (inv.getProjectId() != null) {
                    projectRepository.findById(inv.getProjectId())
                            .ifPresent(p -> res.setProjectName(p.getProjectName()));
                }
            });
        }

        res.setCreatedBy(entity.getCreatedBy());
        res.setCreatedDate(entity.getCreatedDate());
        res.setUpdatedBy(entity.getUpdatedBy());
        res.setUpdatedDate(entity.getUpdatedDate());
        res.setRowVersion(entity.getRowVersion());
        return res;
    }
}
