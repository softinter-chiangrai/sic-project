package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.ChangeRequestRequest;
import com.softinter.sicapi.dto.response.ChangeRequestResponse;
import com.softinter.sicapi.dto.response.CrAssigneeResponse;
import com.softinter.sicapi.dto.response.ChangeImpactResponse;
import com.softinter.sicapi.dto.response.DocumentVersionResponse;
import com.softinter.sicapi.dto.response.PaginationResponse;
import com.softinter.sicapi.entity.enums.TraceRelationship;
import com.softinter.sicapi.entity.pm.*;
import com.softinter.sicapi.repository.pm.*;
import com.softinter.sicapi.repository.su.SuProfileRepository;
import com.softinter.sicapi.service.*;
import com.softinter.sicapi.service.AuditLogService;
import com.softinter.sicapi.service.TraceLinkService;
import com.softinter.sicapi.util.LocalizationHelper;
import com.softinter.sicapi.util.PaginationUtil;
import com.softinter.sicapi.util.JsonSnapshotHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChangeRequestServiceImpl implements ChangeRequestService {

    private final PmChangeRequestRepository changeRequestRepository;
    private final PmRequirementRepository requirementRepository;
    private final PmSpecificationRepository specificationRepository;
    private final PmTaskRepository taskRepository;
    private final SuProfileRepository profileRepository;
    private final CurrentUserService currentUserService;
    private final PmCrAssigneeRepository pmCrAssigneeRepository;
    private final PmChangeImpactRepository pmChangeImpactRepository;
    private final PmCustomerProjectRepository projectRepository;
    private final PmDiagramTabRepository diagramTabRepository;
    private final PmDeliveryRepository deliveryRepository;
    private final PmUserManualRepository userManualRepository;
    private final ApprovalService approvalService;
    private final DocumentVersionService documentVersionService;
    private final AuditLogService auditLogService;
    private final ImpactAnalysisService impactAnalysisService;
    private final TraceLinkService traceLinkService;

    private static final java.util.Map<String, String> CR_STATUS_THAI_MAP = java.util.Map.of(
            "ร่าง", "DRAFT",
            "ส่งแล้ว", "SUBMITTED",
            "อนุมัติ", "APPROVED",
            "ปฏิเสธ", "REJECTED",
            "ดำเนินการแล้ว", "IMPLEMENTED",
            "นำไปใช้แล้ว", "IMPLEMENTED",
            "ยกเลิก", "CANCELLED"
    );

    @Override
    @Transactional
    public ChangeRequestResponse createChangeRequest(ChangeRequestRequest request) {
        validateTargetExists(request.getTargetType(), request.getTargetId());

        // ตรวจสอบสถานะเอกสารเป้าหมาย ห้ามเป็น DRAFT
        String docStatus = getDocumentStatus(request.getTargetType(), request.getTargetId());
        if ("DRAFT".equalsIgnoreCase(docStatus)) {
            throw new IllegalStateException("เอกสารสถานะฉบับร่าง (Draft) สามารถแก้ไขได้โดยตรงโดยไม่ต้องสร้าง Change Request");
        }

        PmChangeRequest cr = new PmChangeRequest();
        // ✅ derive projectId จาก targetType/targetId เสมอ (targetType/targetId บังคับอยู่แล้วจาก validateTargetExists)
        // ห้ามใช้ request.getProjectId() ทับ เพื่อกัน project ไม่ตรงกับ target จริง
        UUID projId = null;
        if (request.getTargetType() != null && request.getTargetId() != null) {
            if ("PROJECT".equalsIgnoreCase(request.getTargetType())) {
                projId = request.getTargetId();
            } else if ("REQUIREMENT".equalsIgnoreCase(request.getTargetType())) {
                projId = requirementRepository.findById(request.getTargetId())
                        .map(r -> r.getProject() != null ? r.getProject().getId() : r.getProjectId())
                        .orElse(null);
            } else if ("SPECIFICATION".equalsIgnoreCase(request.getTargetType())) {
                projId = specificationRepository.findById(request.getTargetId())
                        .map(s -> s.getProject() != null ? s.getProject().getId() : null)
                        .orElse(null);
            } else if ("DELIVERY".equalsIgnoreCase(request.getTargetType())) {
                projId = deliveryRepository.findById(request.getTargetId())
                        .map(PmDelivery::getProjectId)
                        .orElse(null);
            } else if ("USER_MANUAL".equalsIgnoreCase(request.getTargetType())) {
                projId = userManualRepository.findById(request.getTargetId())
                        .map(PmUserManual::getProjectId)
                        .orElse(null);
            }
        }
        // fallback: targetType ที่ยัง derive ไม่ได้ (เช่น TASK, DIAGRAM, CONTRACT) ใช้ค่าจาก request แทน
        if (projId == null) {
            projId = request.getProjectId();
        }
        cr.setProjectId(projId);
        if (request.getCrCode() != null && !request.getCrCode().isBlank()) {
            String code = request.getCrCode().trim();
            if (projId != null && changeRequestRepository.existsByProjectIdAndCrCodeAndIsDeleteFalse(projId, code)) {
                throw new RuntimeException("รหัส Change Request นี้มีอยู่แล้วในโครงการนี้: " + code);
            }
            cr.setCrCode(code);
        } else {
            long count = projId != null ? changeRequestRepository.countByProjectIdAndIsDeleteFalse(projId) + 1 : 1;
            cr.setCrCode("CR-" + String.format("%03d", count));
        }
        cr.setTargetType(request.getTargetType());
        cr.setTargetId(request.getTargetId());
        cr.setTitle(request.getTitle());
        cr.setDescription(request.getDescription());
        cr.setChangeReason(request.getChangeReason());
        cr.setPriority(request.getPriority() != null && !request.getPriority().isBlank() ? request.getPriority() : "MEDIUM");
        cr.setRequesterId(currentUserService.getUserId());
        cr.setStatus("DRAFT");
        cr.setTargetVersion(resolveTargetVersion(request.getTargetType(), request.getTargetId(), request.getTargetVersion()));
        cr.setAssigneeId(request.getAssigneeId());
        cr.setCreatedBy(currentUserService.getUserId());
        cr.setCreatedDate(Instant.now());

        cr = changeRequestRepository.save(cr);

        createChangeRequestTraceLink(cr);

        // Snapshot data
        String snapshotJson = JsonSnapshotHelper.toJson(toResponse(cr));

        // ✅ Create document version
        documentVersionService.createVersion(
                "CHANGE_REQUEST",
                cr.getId(),
                cr.getProjectId(),
                cr.getTitle(),
                "v0.1",
                "สร้างคำขอเปลี่ยนแปลง (Initial change request)",
                snapshotJson
        );

        // บันทึก Assignees
        if (request.getAssignees() != null) {
            for (var aReq : request.getAssignees()) {
                PmCrAssignee assignee = new PmCrAssignee();
                assignee.setChangeRequest(cr);
                assignee.setUserId(aReq.getUserId());
                assignee.setTargetType(aReq.getTargetType());
                assignee.setTargetId(aReq.getTargetId());
                assignee.setStatus("PENDING");
                pmCrAssigneeRepository.save(assignee);
            }
        }

        logCrAudit("CREATE_CR", cr);

        try {
            impactAnalysisService.autoDetectUsingTrace(cr.getId());
        } catch (Exception e) {
            log.error("Auto detect impact error on create CR: {}", e.getMessage());
        }

        return toResponse(cr);
    }

    private void logCrAudit(String action, PmChangeRequest cr) {
        try {
            auditLogService.log(action, "Change Request Management",
                    action.replace("_", " ") + " CR: " + cr.getTitle() + " (" + cr.getCrCode() + ")",
                    "CHANGE_REQUEST", cr.getId(), null, null, "Success", null);
        } catch (Exception e) {
            log.error("ผิดพลาด audit log {}: {}", action, e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public ChangeRequestResponse updateChangeRequest(UUID id, ChangeRequestRequest request) {
        PmChangeRequest cr = changeRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูล Change Request"));

        if (!"DRAFT".equals(cr.getStatus()) && !"SUBMITTED".equals(cr.getStatus())) {
            throw new IllegalStateException("ไม่สามารถแก้ไข Change Request ในสถานะ " + cr.getStatus() + " ได้");
        }

        // ✅ Auto Diff Detection
        List<String> changes = new ArrayList<>();
        com.softinter.sicapi.util.DocumentDiffHelper.checkChange(changes, "รหัสคำขอ (CR Code)", cr.getCrCode(), request.getCrCode());
        com.softinter.sicapi.util.DocumentDiffHelper.checkChange(changes, "ชื่อคำขอ (Title)", cr.getTitle(), request.getTitle());
        com.softinter.sicapi.util.DocumentDiffHelper.checkChange(changes, "รายละเอียด (Description)", cr.getDescription(), request.getDescription());
        com.softinter.sicapi.util.DocumentDiffHelper.checkChange(changes, "สาเหตุ (Reason)", cr.getChangeReason(), request.getChangeReason());
        com.softinter.sicapi.util.DocumentDiffHelper.checkChange(changes, "ความสำคัญ (Priority)", cr.getPriority(), request.getPriority());
        com.softinter.sicapi.util.DocumentDiffHelper.checkChange(changes, "เป้าหมายเวอร์ชัน (Target Version)", cr.getTargetVersion(), request.getTargetVersion());
        String diffSummary = com.softinter.sicapi.util.DocumentDiffHelper.buildDiffSummary(changes, "อัปเดตคำขอเปลี่ยนแปลง " + (request.getTitle() != null ? request.getTitle() : cr.getTitle()));

        // แก้ไขเอกสารจริง (มี field เปลี่ยนแปลง) ขณะที่กำลังรออนุมัติอยู่ (SUBMITTED)
        // ต้องยกเลิกคำขออนุมัติที่ค้างอยู่ และดึงกลับเป็น "DRAFT" เพื่อขออนุมัติใหม่
        if (!changes.isEmpty() && "SUBMITTED".equals(cr.getStatus())) {
            boolean pendingInvalidated = approvalService.invalidatePendingApproval(
                    "CHANGE_REQUEST", cr.getId(), "เอกสารถูกแก้ไขระหว่างรอการอนุมัติ");
            if (pendingInvalidated) {
                cr.setStatus("DRAFT");
            }
        }

        if (request.getCrCode() != null && !request.getCrCode().isBlank()) {
            String code = request.getCrCode().trim();
            if (!code.equals(cr.getCrCode()) && cr.getProjectId() != null
                    && changeRequestRepository.existsByProjectIdAndCrCodeAndIsDeleteFalse(cr.getProjectId(), code)) {
                throw new RuntimeException("รหัส Change Request นี้มีอยู่แล้วในโครงการนี้: " + code);
            }
            cr.setCrCode(code);
        }
        cr.setTitle(request.getTitle());
        cr.setDescription(request.getDescription());
        cr.setChangeReason(request.getChangeReason());
        if (request.getPriority() != null && !request.getPriority().isBlank()) {
            cr.setPriority(request.getPriority());
        }
        if (cr.getProjectId() == null) {
            UUID projId = request.getProjectId();
            if (projId == null && cr.getTargetType() != null && cr.getTargetId() != null) {
                if ("REQUIREMENT".equalsIgnoreCase(cr.getTargetType())) {
                    projId = requirementRepository.findById(cr.getTargetId())
                            .map(r -> r.getProject() != null ? r.getProject().getId() : r.getProjectId())
                            .orElse(null);
                } else if ("SPECIFICATION".equalsIgnoreCase(cr.getTargetType())) {
                    projId = specificationRepository.findById(cr.getTargetId())
                            .map(s -> s.getProject() != null ? s.getProject().getId() : null)
                            .orElse(null);
                }
            }
            if (projId != null) {
                cr.setProjectId(projId);
            }
        }
        cr.setTargetVersion(resolveTargetVersion(cr.getTargetType(), cr.getTargetId(), request.getTargetVersion()));
        cr.setAssigneeId(request.getAssigneeId());
        cr.setUpdatedBy(currentUserService.getUserId());
        cr.setUpdatedDate(Instant.now());

        // Snapshot data
        String snapshotJson = JsonSnapshotHelper.toJson(toResponse(cr));

        // ✅ Dynamic version calculation
        String currentVersion = documentVersionService.getVersions("CHANGE_REQUEST", cr.getId())
                .stream().findFirst().map(DocumentVersionResponse::getVersionNo).orElse("v0.1");
        String nextVersion = documentVersionService.incrementVersion(currentVersion);

        // ✅ Create document version
        documentVersionService.createVersion(
                "CHANGE_REQUEST",
                cr.getId(),
                cr.getProjectId(),
                cr.getTitle(),
                nextVersion,
                diffSummary,
                snapshotJson
        );

        // อัปเดต Assignees (ลบเดิม สร้างใหม่)
        List<PmCrAssignee> existing = pmCrAssigneeRepository.findByChangeRequestIdAndIsDeleteFalse(cr.getId());
        for (var a : existing) {
            a.setIsDelete(true);
            pmCrAssigneeRepository.save(a);
        }

        if (request.getAssignees() != null) {
            for (var aReq : request.getAssignees()) {
                PmCrAssignee assignee = new PmCrAssignee();
                assignee.setChangeRequest(cr);
                assignee.setUserId(aReq.getUserId());
                assignee.setTargetType(aReq.getTargetType());
                assignee.setTargetId(aReq.getTargetId());
                assignee.setStatus("PENDING");
                pmCrAssigneeRepository.save(assignee);
            }
        }

        cr = changeRequestRepository.save(cr);

        createChangeRequestTraceLink(cr);

        try {
            impactAnalysisService.autoDetectUsingTrace(cr.getId());
        } catch (Exception e) {
            log.error("Auto detect impact error on update CR: {}", e.getMessage());
        }

        logCrAudit("UPDATE_CR", cr);

        return toResponse(cr);
    }

    @Override
    @Transactional(readOnly = true)
    public ChangeRequestResponse getChangeRequest(UUID id) {
        PmChangeRequest cr = changeRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูล Change Request"));
        return toResponse(cr);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ChangeRequestResponse> listChangeRequests(UUID projectId, String targetType, UUID targetId, String status, String keyword, Pageable pageable) {
        Specification<PmChangeRequest> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("isDelete")));

            if (projectId != null) {
                predicates.add(cb.equal(root.get("projectId"), projectId));
            }
            if (targetType != null && !targetType.isBlank()) {
                predicates.add(cb.equal(root.get("targetType"), targetType));
            }
            if (targetId != null) {
                predicates.add(cb.equal(root.get("targetId"), targetId));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (keyword != null && !keyword.isBlank()) {
                String rawKw = keyword.trim().toLowerCase();
                String searchPattern = "%" + rawKw + "%";
                List<Predicate> orPreds = new ArrayList<>(List.of(
                        cb.like(cb.lower(root.get("title")), searchPattern),
                        cb.like(cb.lower(root.get("crCode")), searchPattern),
                        cb.like(cb.lower(root.get("description")), searchPattern),
                        cb.like(cb.lower(root.get("changeReason")), searchPattern),
                        cb.like(cb.lower(root.get("requesterId")), searchPattern),
                        cb.like(cb.lower(root.get("assigneeId")), searchPattern),
                        cb.like(cb.lower(root.get("status")), searchPattern),
                        cb.like(cb.lower(root.get("priority")), searchPattern)
                ));

                // ✅ Bilingual: สถานะ (ไทย ↔ อังกฤษ)
                for (var entry : CR_STATUS_THAI_MAP.entrySet()) {
                    if (rawKw.contains(entry.getKey()) || entry.getKey().contains(rawKw)) {
                        orPreds.add(cb.equal(cb.lower(root.get("status")), entry.getValue().toLowerCase()));
                    }
                }

                // ✅ Bilingual: ความสำคัญ (ไทย ↔ อังกฤษ)
                for (var entry : com.softinter.sicapi.util.PriorityKeywordSearchHelper.PRIORITY_THAI_MAP.entrySet()) {
                    if (rawKw.contains(entry.getKey()) || entry.getKey().contains(rawKw)) {
                        orPreds.add(cb.equal(cb.lower(root.get("priority")), entry.getValue().toLowerCase()));
                    }
                }

                // ✅ Bilingual: สถานะการอนุมัติ
                com.softinter.sicapi.util.ApprovalKeywordSearchHelper.addApprovalKeywordPredicates(
                        query, cb, root.get("id"), "CHANGE_REQUEST", rawKw, orPreds);

                predicates.add(cb.or(orPreds.toArray(new Predicate[0])));
            }

            // ถ้า query ไม่ได้ระบุ sort มาจาก client ให้ default เรียงตาม createdDate DESC
            if (query != null && (pageable == null || pageable.getSort().isUnsorted())) {
                query.orderBy(cb.desc(root.get("createdDate")));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<PmChangeRequest> page = changeRequestRepository.findAll(spec, pageable);
        List<ChangeRequestResponse> data = page.getContent().stream()
                .map(this::toResponse)
                .toList();

        return PaginationUtil.of(data, page.getNumber(), page.getSize(), page.getTotalElements());
    }

    @Override
    @Transactional
    public void deleteChangeRequest(UUID id) {
        PmChangeRequest cr = changeRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูล Change Request"));
        approvalService.assertNotApproved("CHANGE_REQUEST", cr.getId());
        cr.setIsDelete(true);
        cr.setDeleteBy(currentUserService.getUserId());
        cr.setDeleteDate(Instant.now());
        changeRequestRepository.save(cr);

        // Soft delete all document versions
        documentVersionService.deleteVersionsByDocument("CHANGE_REQUEST", cr.getId());

        logCrAudit("DELETE_CR", cr);
    }

    @Override
    @Transactional
    public ChangeRequestResponse submitForApproval(UUID id) {
        PmChangeRequest cr = changeRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูล Change Request"));

        if (!"DRAFT".equals(cr.getStatus())) {
            throw new IllegalStateException("สามารถส่งขออนุมัติได้เฉพาะ Change Request ที่อยู่ในสถานะฉบับร่าง (Draft) เท่านั้น");
        }

        // ค้นหาหรือระบุ flow สำหรับอนุมัติ Change Request (สมมติว่าใช้ flow ตัวแรกที่ผูกกับ Change Request หรือกำหนดดีฟอลต์)
        // เนื่องจาก ApprovalServiceImpl มี helper `updateDocumentStatusOnSubmit` ที่จะคอยอัปเดตเป็น SUBMITTED ให้เมื่อ submit สำเร็จ
        // เราทำการเรียก submitForApproval ไปที่ ApprovalService
        String docCode = cr.getCrCode() != null && !cr.getCrCode().isBlank()
                ? cr.getCrCode()
        : "CR-" + cr.getId().toString().substring(0, 8).toUpperCase();
        com.softinter.sicapi.dto.request.ApprovalSubmitRequest submitReq = new com.softinter.sicapi.dto.request.ApprovalSubmitRequest();
        submitReq.setDocumentType("CHANGE_REQUEST");
        submitReq.setDocumentId(cr.getId());
        submitReq.setDocumentCode(docCode);
        submitReq.setDocumentTitle(cr.getTitle());
        submitReq.setComment("ส่งขออนุมัติ Change Request: " + cr.getTitle());
        
        approvalService.submitForApproval(submitReq);

        return toResponse(cr);
    }

    @Override
    @Transactional
    public ChangeRequestResponse approve(UUID id, String approvedBy) {
        PmChangeRequest cr = changeRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูล Change Request"));

        cr.setStatus("APPROVED");
        cr.setApprovedBy(approvedBy);
        cr.setApprovedAt(Instant.now());
        cr.setUpdatedBy(currentUserService.getUserId());
        cr.setUpdatedDate(Instant.now());
        cr = changeRequestRepository.save(cr);

        // ปลดล็อคเอกสารเป้าหมาย (ปัดเวอร์ชันขึ้นเป็นเลขเต็มถัดไป + ตั้งสถานะกลับเป็นแก้ไขได้)
        approvalService.unlockDocumentAfterChange(cr.getTargetType(), cr.getTargetId(),
                "Change Request " + cr.getCrCode() + " approved", true);

        return toResponse(cr);
    }

    @Override
    @Transactional
    public ChangeRequestResponse reject(UUID id, String reason) {
        PmChangeRequest cr = changeRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูล Change Request"));

        cr.setStatus("REJECTED");
        cr.setUpdatedBy(currentUserService.getUserId());
        cr.setUpdatedDate(Instant.now());
        if (reason != null && !reason.isBlank()) {
            cr.setDescription(cr.getDescription() + "\n[Rejected] " + reason);
        }
        cr = changeRequestRepository.save(cr);
        return toResponse(cr);
    }

    @Override
    @Transactional
    public ChangeRequestResponse implement(UUID id) {
        PmChangeRequest cr = changeRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูล Change Request"));

        if (!"APPROVED".equals(cr.getStatus())) {
            throw new IllegalStateException("สามารถดำเนินการได้เฉพาะ Change Request ที่ได้รับการอนุมัติแล้วเท่านั้น");
        }

        cr.setStatus("IMPLEMENTED");
        cr.setImplementedAt(Instant.now());
        cr.setUpdatedBy(currentUserService.getUserId());
        cr.setUpdatedDate(Instant.now());
        cr = changeRequestRepository.save(cr);

        // ปลดล็อคเอกสารเป้าหมายทั้งหมด: bump เวอร์ชัน, ตั้งสถานะกลับเป็นแก้ไขได้,
        // และ deactivate PmApproval record เดิมที่ APPROVED อยู่
        String unlockReason = "Change Request " + cr.getCrCode() + " implemented";
        List<PmCrAssignee> assignees = pmCrAssigneeRepository.findByChangeRequestIdAndIsDeleteFalse(cr.getId());
        for (PmCrAssignee assignee : assignees) {
            approvalService.unlockDocumentAfterChange(assignee.getTargetType(), assignee.getTargetId(), unlockReason);
        }

        // สำหรับ target หลักของ CR เอง
        approvalService.unlockDocumentAfterChange(cr.getTargetType(), cr.getTargetId(), unlockReason);

        try {
            auditLogService.log(
                    "IMPLEMENT_CHANGE_REQUEST",
                    "Change Request / " + cr.getTargetType(),
                    "ดำเนินการตาม Change Request " + cr.getCrCode() + " และปลดล็อคเอกสารเป้าหมายเรียบร้อยแล้ว",
                    cr.getTargetType(),
                    cr.getTargetId(),
                    null, null, "Success",
                    "Implemented by: " + currentUserService.getUsername());
        } catch (Exception e) {
            log.error("Error creating audit log on implement CR: {}", e.getMessage(), e);
        }

        return toResponse(cr);
    }

    @Override
    @Transactional
    public ChangeRequestResponse markAssigneeComplete(UUID changeRequestId, String userId, UUID targetId) {
        PmCrAssignee assignee = pmCrAssigneeRepository.findByUserIdAndChangeRequestIdAndIsDeleteFalse(userId, changeRequestId)
                .orElseThrow(() -> new RuntimeException("ไม่พบผู้รับผิดชอบนี้ใน Change Request"));

        assignee.setStatus("COMPLETED");
        assignee.setCompletedAt(Instant.now());
        pmCrAssigneeRepository.save(assignee);

        // ปลดล็อคเอกสารของ Assignee คนนี้ (bump เวอร์ชัน + ตั้งสถานะกลับเป็นแก้ไขได้)
        approvalService.unlockDocumentAfterChange(assignee.getTargetType(), assignee.getTargetId(),
                "Change Request assignee completed their part");

        // ตรวจสอบว่าทุกคนทำเสร็จครบหรือยัง หากครบแล้วให้ปรับสถานะ CR เป็น IMPLEMENTED อัตโนมัติ
        List<PmCrAssignee> pending = pmCrAssigneeRepository.findByChangeRequestIdAndStatusAndIsDeleteFalse(changeRequestId, "PENDING");
        PmChangeRequest cr = changeRequestRepository.findById(changeRequestId)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูล Change Request"));
        if (pending.isEmpty()) {
            cr.setStatus("IMPLEMENTED");
            cr.setImplementedAt(Instant.now());
            changeRequestRepository.save(cr);
        }

        return toResponse(cr);
    }

    // ============================ Helper Methods ============================

    private void createChangeRequestTraceLink(PmChangeRequest cr) {
        if (cr.getProjectId() == null || cr.getTargetType() == null || cr.getTargetId() == null) {
            return;
        }
        try {
            traceLinkService.createLink(cr.getProjectId(),
                    "CHANGE_REQUEST", cr.getId(),
                    cr.getTargetType(), cr.getTargetId(),
                    TraceRelationship.AFFECTED_BY);
        } catch (Exception e) {
            log.warn("Failed to create trace link for change request: {}", e.getMessage());
        }
    }

    private String getDocumentStatus(String targetType, UUID targetId) {
        if (targetType == null || targetId == null) {
            return "DRAFT";
        }
        switch (targetType.toUpperCase()) {
            case "REQUIREMENT":
                return requirementRepository.findById(targetId).map(PmRequirement::getStatus).orElse("DRAFT");
            case "SPECIFICATION":
                return specificationRepository.findById(targetId).map(PmSpecification::getStatus).orElse("DRAFT");
            case "DIAGRAM":
                return approvalService.isApproved("DIAGRAM", targetId) ? "APPROVED" : "DRAFT";
            default:
                // สำหรับ CONTRACT, DESIGN_REVIEW, DELIVERY, USER_MANUAL, INVOICE, MA_TICKET, MA_RENEWAL ฯลฯ
                return approvalService.isApproved(targetType.toUpperCase(), targetId) ? "APPROVED" : "DRAFT";
        }
    }

    private void validateTargetExists(String targetType, UUID targetId) {
        if (targetType == null || targetId == null) {
            throw new IllegalArgumentException("ต้องระบุประเภทเอกสารและรหัสเอกสารเป้าหมาย");
        }
        switch (targetType.toUpperCase()) {
            case "REQUIREMENT":
                if (!requirementRepository.existsById(targetId)) {
                    throw new RuntimeException("ไม่พบ Requirement ที่ระบุ: " + targetId);
                }
                break;
            case "SPECIFICATION":
                if (!specificationRepository.existsById(targetId)) {
                    throw new RuntimeException("ไม่พบ Specification ที่ระบุ: " + targetId);
                }
                break;
            case "TASK":
                if (!taskRepository.existsById(targetId)) {
                    throw new RuntimeException("ไม่พบ Task ที่ระบุ: " + targetId);
                }
                break;
            case "DIAGRAM":
                if (!diagramTabRepository.existsById(targetId)) {
                    throw new RuntimeException("ไม่พบ Diagram ที่ระบุ: " + targetId);
                }
                break;
            case "CONTRACT":
            case "DESIGN_REVIEW":
            case "DELIVERY":
            case "USER_MANUAL":
            case "INVOICE":
            case "MA_TICKET":
            case "MA_RENEWAL":
            case "DFD":
            case "ER":
                // เอกสารประเภทอื่น ๆ ที่ระบบรองรับ
                break;
            default:
                // ยอมรับประเภทเอกสารที่มีในระบบเพื่อความยืดหยุ่นของ Approval & CR Flow
                log.warn("[ChangeRequest] Validating custom/dynamic targetType: {}", targetType);
                break;
        }
    }

    private ChangeRequestResponse toResponse(PmChangeRequest cr) {
        ChangeRequestResponse response = new ChangeRequestResponse();
        response.setId(cr.getId());
        response.setCrCode(cr.getCrCode());
        response.setProjectId(cr.getProjectId());
        if (cr.getProjectId() != null) {
            projectRepository.findById(cr.getProjectId())
                    .ifPresent(p -> response.setProjectName(p.getProjectName()));
        }
        response.setTargetType(cr.getTargetType());
        response.setTargetId(cr.getTargetId());
        response.setTitle(cr.getTitle());
        response.setDescription(cr.getDescription());
        response.setChangeReason(cr.getChangeReason());
        response.setPriority(cr.getPriority() != null ? cr.getPriority() : "MEDIUM");
        response.setRequesterId(cr.getRequesterId());
        response.setRequesterName(getUserName(cr.getRequesterId()));
        response.setAssigneeId(cr.getAssigneeId());
        response.setAssigneeName(getUserName(cr.getAssigneeId()));
        response.setStatus(cr.getStatus());
        response.setIsLocked(approvalService.isApproved("CHANGE_REQUEST", cr.getId()));
        String targetVer = cr.getTargetVersion();
        if (targetVer == null || targetVer.isBlank()) {
            targetVer = resolveTargetVersion(cr.getTargetType(), cr.getTargetId(), null);
        }
        response.setTargetVersion(targetVer != null ? targetVer : "-");
        response.setApprovedBy(cr.getApprovedBy());
        response.setApprovedAt(cr.getApprovedAt());
        response.setImplementedAt(cr.getImplementedAt());
        response.setCreatedDate(cr.getCreatedDate());

        List<PmCrAssignee> assignees = pmCrAssigneeRepository.findByChangeRequestIdAndIsDeleteFalse(cr.getId());
        response.setAssignees(assignees.stream().map(this::toAssigneeResponse).collect(Collectors.toList()));

        List<PmChangeImpact> impacts = pmChangeImpactRepository.findByChangeRequestIdAndIsDeleteFalse(cr.getId());
        response.setImpacts(impacts.stream().map(this::toImpactResponse).collect(Collectors.toList()));

        return response;
    }

    private String resolveTargetVersion(String targetType, UUID targetId, String requestedVersion) {
        if (requestedVersion != null && !requestedVersion.isBlank()) {
            return requestedVersion;
        }
        if (targetType == null || targetId == null) {
            return null;
        }
        switch (targetType.toUpperCase()) {
            case "REQUIREMENT":
                return requirementRepository.findById(targetId)
                        .map(r -> documentVersionService.incrementVersion(r.getVersion()))
                        .orElse("v1.1");
            case "SPECIFICATION":
                return specificationRepository.findById(targetId)
                        .map(s -> documentVersionService.incrementVersion(s.getVersion()))
                        .orElse("v1.1");
            case "DELIVERY":
                return deliveryRepository.findById(targetId)
                        .map(d -> documentVersionService.incrementVersion(d.getDeliveryVersion()))
                        .orElse("0.2");
            case "USER_MANUAL":
                return userManualRepository.findById(targetId)
                        .map(m -> documentVersionService.incrementVersion(m.getVersion()))
                        .orElse("0.2");
            case "DIAGRAM":
            default:
                return "v1.1";
        }
    }

    private CrAssigneeResponse toAssigneeResponse(PmCrAssignee a) {
        CrAssigneeResponse resp = new CrAssigneeResponse();
        resp.setId(a.getId());
        resp.setUserId(a.getUserId());
        resp.setUserName(getUserName(a.getUserId()));
        resp.setTargetType(a.getTargetType());
        resp.setTargetId(a.getTargetId());
        resp.setStatus(a.getStatus());
        resp.setCompletedAt(a.getCompletedAt());
        return resp;
    }

    private ChangeImpactResponse toImpactResponse(PmChangeImpact i) {
        ChangeImpactResponse resp = new ChangeImpactResponse();
        resp.setId(i.getId());
        resp.setImpactedType(i.getImpactedType());
        resp.setImpactedId(i.getImpactedId());
        resp.setImpactedTitle(i.getImpactedTitle());
        resp.setImpactLevel(i.getImpactLevel());
        return resp;
    }

    private String getUserName(String userId) {
        if (userId == null) return userId;
        return profileRepository.findByUserId(userId)
                .map(LocalizationHelper::getFullName)
                .orElse(userId);
    }
}