package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.PmMaRenewalRequest;
import com.softinter.sicapi.dto.response.PmMaRenewalResponse;
import com.softinter.sicapi.entity.enums.EntityState;
import com.softinter.sicapi.entity.enums.MaRenewalStatus;
import com.softinter.sicapi.entity.pm.PmCustomerContract;
import com.softinter.sicapi.entity.pm.PmMaRenewal;
import com.softinter.sicapi.repository.pm.PmCustomerContractRepository;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmCustomerRepository;
import com.softinter.sicapi.repository.pm.PmMaRenewalRepository;
import com.softinter.sicapi.service.PmMaRenewalService;
import com.softinter.sicapi.service.ApprovalService;
import com.softinter.sicapi.service.AuditLogService;
import com.softinter.sicapi.dto.response.DocumentVersionResponse;
import com.softinter.sicapi.service.DocumentVersionService;
import com.softinter.sicapi.util.DocumentDiffHelper;
import com.softinter.sicapi.util.JsonSnapshotHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PmMaRenewalServiceImpl implements PmMaRenewalService {

    private final PmMaRenewalRepository renewalRepository;
    private final PmCustomerContractRepository contractRepository;
    private final PmCustomerRepository customerRepository;
    private final PmCustomerProjectRepository projectRepository;
    private final AuditLogService auditLogService;
    private final ApprovalService approvalService;
    private final DocumentVersionService documentVersionService;

    @Override
    @Transactional(readOnly = true)
    public Page<PmMaRenewalResponse> findAll(UUID businessId, UUID projectId, Pageable pageable) {
        Page<PmMaRenewal> page;
        if (projectId != null) {
            page = renewalRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(businessId, projectId, pageable);
        } else {
            page = renewalRepository.findByBusinessIdAndIsDeleteFalse(businessId, pageable);
        }
        return page.map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PmMaRenewalResponse findById(UUID id, UUID businessId) {
        PmMaRenewal renewal = renewalRepository.findByIdAndBusinessIdAndIsDeleteFalse(id, businessId)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลการต่อสัญญา MA"));
        return toResponse(renewal);
    }

    @Override
    @Transactional
    public UUID save(PmMaRenewalRequest request, UUID businessId, String userId) {
        EntityState state = request.getState() != null ? EntityState.values()[request.getState()] : EntityState.DETACHED;
        PmMaRenewal entity;
        boolean isNew = (request.getId() == null);

        List<String> changes = new ArrayList<>();
        if (state == EntityState.DELETED) {
            delete(request.getId(), businessId, userId);
            return request.getId();
        } else if (isNew) {
            entity = new PmMaRenewal();
            entity.setBusinessId(businessId);
            entity.setCreatedBy(userId);
            entity.setCreatedDate(Instant.now());
            mapRequestToEntity(request, entity);
            if (entity.getRenewalNo() == null || entity.getRenewalNo().isBlank()) {
                long count = renewalRepository.countByProjectIdAndIsDeleteFalse(entity.getProjectId()) + 1;
                entity.setRenewalNo("MAR-" + String.format("%03d", count));
            } else if (renewalRepository.existsByBusinessIdAndProjectIdAndRenewalNoAndIsDeleteFalse(
                    businessId, entity.getProjectId(), entity.getRenewalNo())) {
                throw new RuntimeException("รหัสข้อเสนอต่อสัญญานี้มีอยู่แล้วในโครงการนี้: " + entity.getRenewalNo());
            }
            entity = renewalRepository.save(entity);

            // ✅ Initial Version
            try {
                documentVersionService.createVersion(
                        "MA_RENEWAL",
                        entity.getId(),
                        entity.getProjectId(),
                        entity.getRenewalNo(),
                        "v0.1",
                        "สร้างรายการต่อสัญญา MA เริ่มต้น",
                        JsonSnapshotHelper.toJson(toResponse(entity))
                );
            } catch (Exception e) {
                log.error("Error creating document version on create MA renewal: {}", e.getMessage(), e);
            }

            try {
                auditLogService.log("CREATE_MA_RENEWAL", "MA Renewal Management",
                        "สร้างรายการต่อสัญญา MA: " + entity.getRenewalNo(),
                        "MA_RENEWAL", entity.getId(), null, null, "Success", null);
            } catch (Exception e) {
                log.error("ผิดพลาด audit log CREATE_MA_RENEWAL: {}", e.getMessage(), e);
            }
        } else {
            entity = renewalRepository.findByIdAndBusinessIdAndIsDeleteFalse(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลการต่อสัญญา MA"));
            approvalService.assertNotApproved("MA_RENEWAL", entity.getId());
            if (request.getRowVersion() != null && !request.getRowVersion().equals(entity.getRowVersion())) {
                throw new RuntimeException("ข้อมูลถูกแก้ไขโดยผู้อื่น กรุณารีเฟรชข้อมูล");
            }

            DocumentDiffHelper.checkChange(changes, "รหัสต่อสัญญา (Renewal No)", entity.getRenewalNo(), request.getRenewalNo());
            DocumentDiffHelper.checkChange(changes, "สถานะ (Status)", entity.getStatus() != null ? entity.getStatus().name() : null, request.getStatus() != null ? request.getStatus().name() : null);
            DocumentDiffHelper.checkChange(changes, "ยอดเงินเสนอ (Proposed Amount)", entity.getProposedAmount() != null ? entity.getProposedAmount().toString() : null, request.getProposedAmount() != null ? request.getProposedAmount().toString() : null);
            DocumentDiffHelper.checkChange(changes, "หมายเหตุ (Remark)", entity.getRemark(), request.getRemark());

            if (!changes.isEmpty()) {
                approvalService.invalidatePendingApproval("MA_RENEWAL", entity.getId(), "เอกสารถูกแก้ไขระหว่างรอการอนุมัติ");
            }

            mapRequestToEntity(request, entity);
            entity.setUpdatedBy(userId);
            entity.setUpdatedDate(Instant.now());
            entity = renewalRepository.save(entity);

            // ✅ Dynamic Increment Version
            try {
                String currentVer = documentVersionService.getVersions("MA_RENEWAL", entity.getId())
                        .stream().findFirst().map(DocumentVersionResponse::getVersionNo).orElse("v0.1");
                String nextVer = documentVersionService.incrementVersion(currentVer);
                String diffSummary = DocumentDiffHelper.buildDiffSummary(changes, "แก้ไขรายการต่อสัญญา: " + entity.getRenewalNo());
                documentVersionService.createVersion(
                        "MA_RENEWAL",
                        entity.getId(),
                        entity.getProjectId(),
                        entity.getRenewalNo(),
                        nextVer,
                        diffSummary,
                        JsonSnapshotHelper.toJson(toResponse(entity))
                );
            } catch (Exception e) {
                log.error("Error creating document version on update MA renewal: {}", e.getMessage(), e);
            }

            try {
                auditLogService.log("UPDATE_MA_RENEWAL", "MA Renewal Management",
                        "แก้ไขรายการต่อสัญญา MA: " + entity.getRenewalNo(),
                        "MA_RENEWAL", entity.getId(), null, null, "Success", null);
            } catch (Exception e) {
                log.error("ผิดพลาด audit log UPDATE_MA_RENEWAL: {}", e.getMessage(), e);
            }
        }

        // Auto create new contract if CONFIRMED and newContractId is null
        if (entity.getStatus() == MaRenewalStatus.CONFIRMED && entity.getNewContractId() == null) {
            PmCustomerContract newContract = new PmCustomerContract();
            newContract.setBusinessId(businessId);
            newContract.setCustomerId(entity.getCustomerId());
            newContract.setProjectId(entity.getProjectId());
            newContract.setContractNo("CT-MA-" + System.currentTimeMillis());
            newContract.setContractType("MA");
            newContract.setStartDate(entity.getNewStartDate());
            newContract.setEndDate(entity.getNewEndDate());
            newContract.setContractValue(entity.getProposedAmount());
            newContract.setSignStatus("ACTIVE");
            newContract.setCreatedBy(userId);
            newContract.setCreatedDate(Instant.now());
            newContract = contractRepository.save(newContract);

            entity.setNewContractId(newContract.getId());
            renewalRepository.save(entity);
        }

        return entity.getId();
    }

    @Override
    @Transactional
    public void delete(UUID id, UUID businessId, String userId) {
        PmMaRenewal renewal = renewalRepository.findByIdAndBusinessIdAndIsDeleteFalse(id, businessId)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลการต่อสัญญา MA"));
        approvalService.assertNotApproved("MA_RENEWAL", renewal.getId());
        renewal.setIsDelete(true);
        renewal.setDeleteBy(userId);
        renewal.setDeleteDate(Instant.now());
        renewalRepository.save(renewal);

        // ✅ Soft Delete Document Versions
        documentVersionService.deleteVersionsByDocument("MA_RENEWAL", renewal.getId());

        try {
            auditLogService.log("DELETE_MA_RENEWAL", "MA Renewal Management",
                    "ลบรายการต่อสัญญา MA: " + renewal.getRenewalNo(),
                    "MA_RENEWAL", renewal.getId(), null, null, "Success", null);
        } catch (Exception e) {
            log.error("ผิดพลาด audit log DELETE_MA_RENEWAL: {}", e.getMessage(), e);
        }
    }

    private void mapRequestToEntity(PmMaRenewalRequest req, PmMaRenewal entity) {
        entity.setRenewalNo(req.getRenewalNo());
        entity.setContractId(req.getContractId());
        entity.setCustomerId(req.getCustomerId());
        entity.setProjectId(req.getProjectId());
        entity.setCurrentEndDate(req.getCurrentEndDate() != null ? req.getCurrentEndDate() : Instant.now());
        entity.setNewStartDate(req.getNewStartDate() != null ? req.getNewStartDate() : Instant.now());
        entity.setNewEndDate(req.getNewEndDate() != null ? req.getNewEndDate() : Instant.now().plus(java.time.Duration.ofDays(365)));
        entity.setProposedAmount(req.getProposedAmount() != null ? req.getProposedAmount() : BigDecimal.ZERO);
        entity.setStatus(req.getStatus() != null ? req.getStatus() : MaRenewalStatus.DRAFT);
        entity.setNewContractId(req.getNewContractId());
        entity.setRemark(req.getRemark());
    }

    private PmMaRenewalResponse toResponse(PmMaRenewal entity) {
        PmMaRenewalResponse res = new PmMaRenewalResponse();
        res.setId(entity.getId());
        res.setBusinessId(entity.getBusinessId());
        res.setRenewalNo(entity.getRenewalNo());
        res.setContractId(entity.getContractId());
        res.setCustomerId(entity.getCustomerId());
        res.setProjectId(entity.getProjectId());
        res.setCurrentEndDate(entity.getCurrentEndDate());
        res.setNewStartDate(entity.getNewStartDate());
        res.setNewEndDate(entity.getNewEndDate());
        res.setProposedAmount(entity.getProposedAmount());
        res.setStatus(entity.getStatus());
        res.setIsLocked(approvalService.isApproved("MA_RENEWAL", entity.getId()));
        res.setNewContractId(entity.getNewContractId());
        res.setRemark(entity.getRemark());

        if (entity.getContractId() != null) {
            contractRepository.findById(entity.getContractId())
                    .ifPresent(c -> res.setContractNo(c.getContractNo()));
        }
        if (entity.getCustomerId() != null) {
            customerRepository.findById(entity.getCustomerId())
                    .ifPresent(c -> res.setCustomerName(c.getCompanyNameLocal() != null ? c.getCompanyNameLocal() : c.getCompanyNameEn()));
        }
        if (entity.getProjectId() != null) {
            projectRepository.findById(entity.getProjectId())
                    .ifPresent(p -> res.setProjectName(p.getProjectName()));
        }

        res.setCreatedBy(entity.getCreatedBy());
        res.setCreatedDate(entity.getCreatedDate());
        res.setUpdatedBy(entity.getUpdatedBy());
        res.setUpdatedDate(entity.getUpdatedDate());
        res.setRowVersion(entity.getRowVersion());
        return res;
    }
}
