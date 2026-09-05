package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.PmMaTicketRequest;
import com.softinter.sicapi.dto.response.PmMaTicketResponse;
import com.softinter.sicapi.entity.enums.EntityState;
import com.softinter.sicapi.entity.enums.MaTicketSeverity;
import com.softinter.sicapi.entity.enums.MaTicketStatus;
import com.softinter.sicapi.entity.enums.MaTicketType;
import com.softinter.sicapi.entity.pm.PmMaTicket;
import com.softinter.sicapi.entity.pm.PmMaTicketAssignee;
import com.softinter.sicapi.repository.pm.PmCustomerContractRepository;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmCustomerRepository;
import com.softinter.sicapi.repository.pm.PmMaTicketAssigneeRepository;
import com.softinter.sicapi.repository.pm.PmMaTicketRepository;
import com.softinter.sicapi.service.ApprovalService;
import com.softinter.sicapi.service.DocumentVersionService;
import com.softinter.sicapi.service.PmMaTicketService;
import com.softinter.sicapi.service.AuditLogService;
import com.softinter.sicapi.util.DocumentDiffHelper;
import com.softinter.sicapi.util.JsonSnapshotHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PmMaTicketServiceImpl implements PmMaTicketService {

    private final PmMaTicketRepository ticketRepository;
    private final PmMaTicketAssigneeRepository ticketAssigneeRepository;
    private final PmCustomerRepository customerRepository;
    private final PmCustomerProjectRepository projectRepository;
    private final PmCustomerContractRepository contractRepository;
    private final DocumentVersionService documentVersionService;
    private final AuditLogService auditLogService;
    private final ApprovalService approvalService;

    @Override
    @Transactional(readOnly = true)
    public Page<PmMaTicketResponse> findAll(UUID businessId, UUID projectId, Pageable pageable) {
        Page<PmMaTicket> page;
        if (projectId != null) {
            page = ticketRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(businessId, projectId, pageable);
        } else {
            page = ticketRepository.findByBusinessIdAndIsDeleteFalse(businessId, pageable);
        }
        return page.map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PmMaTicketResponse findById(UUID id, UUID businessId) {
        PmMaTicket ticket = ticketRepository.findByIdAndBusinessIdAndIsDeleteFalse(id, businessId)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูล Ticket MA"));
        return toResponse(ticket);
    }

    @Override
    @Transactional
    public UUID save(PmMaTicketRequest request, UUID businessId, String userId) {
        EntityState state = request.getState() != null ? EntityState.values()[request.getState()] : EntityState.DETACHED;
        PmMaTicket entity;
        String diffSummary = "สร้างตั๋วแจ้งปัญหา MA (Initial MA ticket)";
        boolean isNew = (request.getId() == null);

        if (state == EntityState.DELETED) {
            delete(request.getId(), businessId, userId);
            return request.getId();
        } else if (isNew) {
            entity = new PmMaTicket();
            entity.setBusinessId(businessId);
            entity.setCreatedBy(userId);
            entity.setCreatedDate(Instant.now());
            mapRequestToEntity(request, entity);
            if (entity.getTicketNo() == null || entity.getTicketNo().isBlank()) {
                long count = ticketRepository.countByProjectIdAndIsDeleteFalse(entity.getProjectId()) + 1;
                entity.setTicketNo("TK-" + String.format("%03d", count));
            } else if (ticketRepository.existsByBusinessIdAndProjectIdAndTicketNoAndIsDeleteFalse(
                    businessId, entity.getProjectId(), entity.getTicketNo())) {
                throw new RuntimeException("รหัสตั๋ว MA นี้มีอยู่แล้วในโครงการนี้: " + entity.getTicketNo());
            }
            calculateSlaDates(entity);
            entity = ticketRepository.save(entity);
            saveAssignees(entity, request.getAssignedToIds());

            try {
                auditLogService.log("CREATE_MA_TICKET", "MA Ticket Management",
                        "สร้างตั๋วปัญหา MA: " + entity.getTitle() + " (" + entity.getTicketNo() + ")",
                        "MA_TICKET", entity.getId(), null, null, "Success", null);
            } catch (Exception e) {
                log.error("ผิดพลาด audit log CREATE_MA_TICKET: {}", e.getMessage(), e);
            }
        } else {
            entity = ticketRepository.findByIdAndBusinessIdAndIsDeleteFalse(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูล Ticket MA"));
            approvalService.assertNotApproved("MA_TICKET", entity.getId());
            if (request.getRowVersion() != null && !request.getRowVersion().equals(entity.getRowVersion())) {
                throw new RuntimeException("ข้อมูลถูกแก้ไขโดยผู้อื่น กรุณารีเฟรชข้อมูล");
            }
            MaTicketStatus oldStatus = entity.getStatus();

            // ✅ Auto Diff Detection
            List<String> oldAssigneeIds = ticketAssigneeRepository.findByMaTicketId(entity.getId()).stream()
                    .map(PmMaTicketAssignee::getUserId)
                    .collect(Collectors.toList());
            List<String> changes = new ArrayList<>();
            DocumentDiffHelper.checkChange(changes, "หัวข้อปัญหา (Title)", entity.getTitle(), request.getTitle());
            DocumentDiffHelper.checkChange(changes, "สถานะ (Status)", entity.getStatus(), request.getStatus());
            DocumentDiffHelper.checkChange(changes, "ระดับความรุนแรง (Severity)", entity.getSeverity(), request.getSeverity());
            DocumentDiffHelper.checkChange(changes, "ผู้รับผิดชอบ (Assigned To)", oldAssigneeIds, request.getAssignedToIds());
            diffSummary = DocumentDiffHelper.buildDiffSummary(changes, "อัปเดตตั๋วปัญหา " + (request.getTitle() != null ? request.getTitle() : entity.getTitle()));

            mapRequestToEntity(request, entity);

            // แก้ไขเอกสารจริง (มี field เปลี่ยนแปลง) ขณะที่เคยอนุมัติแล้ว (RESOLVED) หรือกำลังรออนุมัติอยู่
            // ต้องเปลี่ยนสถานะกลับเป็น "Changed" และยกเลิกคำขออนุมัติที่ค้างอยู่ (ถ้ามี) เพื่อขออนุมัติใหม่
            if (!changes.isEmpty()) {
                boolean pendingInvalidated = approvalService.invalidatePendingApproval(
                        "MA_TICKET", entity.getId(), "เอกสารถูกแก้ไขระหว่างรอการอนุมัติ");
                if (oldStatus == MaTicketStatus.RESOLVED || pendingInvalidated) {
                    entity.setStatus(MaTicketStatus.CHANGED);
                    entity.setResolvedDate(null);
                }
            }

            entity.setUpdatedBy(userId);
            entity.setUpdatedDate(Instant.now());
            entity = ticketRepository.save(entity);
            ticketAssigneeRepository.deleteByMaTicketId(entity.getId());
            saveAssignees(entity, request.getAssignedToIds());

            try {
                auditLogService.log("UPDATE_MA_TICKET", "MA Ticket Management",
                        "แก้ไขตั๋วปัญหา MA: " + entity.getTitle() + " (" + entity.getTicketNo() + ")",
                        "MA_TICKET", entity.getId(), null, null, "Success", null);
            } catch (Exception e) {
                log.error("ผิดพลาด audit log UPDATE_MA_TICKET: {}", e.getMessage(), e);
            }
        }

        // Snapshot data
        String snapshotJson = JsonSnapshotHelper.toJson(toResponse(entity));

        // ✅ Create document version
        documentVersionService.createVersion(
                "MA_TICKET",
                entity.getId(),
                entity.getProjectId(),
                entity.getTicketNo(),
                "v0.1",
                diffSummary,
                snapshotJson
        );

        return entity.getId();
    }

    @Override
    @Transactional
    public void delete(UUID id, UUID businessId, String userId) {
        PmMaTicket ticket = ticketRepository.findByIdAndBusinessIdAndIsDeleteFalse(id, businessId)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูล Ticket MA"));
        approvalService.assertNotApproved("MA_TICKET", ticket.getId());
        ticket.setIsDelete(true);
        ticket.setDeleteBy(userId);
        ticket.setDeleteDate(Instant.now());
        ticketRepository.save(ticket);

        try {
            auditLogService.log("DELETE_MA_TICKET", "MA Ticket Management",
                    "ลบตั๋วปัญหา MA: " + ticket.getTitle() + " (" + ticket.getTicketNo() + ")",
                    "MA_TICKET", ticket.getId(), null, null, "Success", null);
        } catch (Exception e) {
            log.error("ผิดพลาด audit log DELETE_MA_TICKET: {}", e.getMessage(), e);
        }
    }

    private void calculateSlaDates(PmMaTicket ticket) {
        Instant now = ticket.getReportedDate() != null ? ticket.getReportedDate() : Instant.now();
        MaTicketSeverity severity = ticket.getSeverity() != null ? ticket.getSeverity() : MaTicketSeverity.MEDIUM;

        long responseHours = 4;
        long resolveHours = 24;

        if (severity == MaTicketSeverity.CRITICAL) {
            responseHours = 1;
            resolveHours = 4;
        } else if (severity == MaTicketSeverity.HIGH) {
            responseHours = 2;
            resolveHours = 8;
        } else if (severity == MaTicketSeverity.LOW) {
            responseHours = 8;
            resolveHours = 48;
        }

        ticket.setTargetResponseDate(now.plus(responseHours, ChronoUnit.HOURS));
        ticket.setTargetResolveDate(now.plus(resolveHours, ChronoUnit.HOURS));
    }

    private void mapRequestToEntity(PmMaTicketRequest req, PmMaTicket entity) {
        entity.setTicketNo(req.getTicketNo());
        entity.setCustomerId(req.getCustomerId());
        entity.setProjectId(req.getProjectId());
        entity.setContractId(req.getContractId());
        entity.setTicketType(req.getTicketType() != null ? req.getTicketType() : MaTicketType.BUG_SUPPORT);
        entity.setTitle(req.getTitle());
        entity.setDescription(req.getDescription());
        entity.setSeverity(req.getSeverity() != null ? req.getSeverity() : MaTicketSeverity.MEDIUM);

        MaTicketStatus status = req.getStatus() != null ? req.getStatus() : MaTicketStatus.OPEN;
        entity.setStatus(status);
        if (status == MaTicketStatus.RESOLVED && entity.getResolvedDate() == null) {
            entity.setResolvedDate(Instant.now());
        }
        if (status == MaTicketStatus.CLOSED && entity.getClosedDate() == null) {
            entity.setClosedDate(Instant.now());
        }

        entity.setReportedBy(req.getReportedBy() != null ? req.getReportedBy() : "Customer");
        entity.setStartDate(req.getStartDate());
        entity.setStartTime(req.getStartTime());
        entity.setEndDate(req.getEndDate());
        entity.setEndTime(req.getEndTime());
        entity.setResolutionSummary(req.getResolutionSummary());
    }

    private void saveAssignees(PmMaTicket ticket, List<String> assigneeIds) {
        if (assigneeIds == null || assigneeIds.isEmpty()) {
            return;
        }
        for (String userId : assigneeIds) {
            if (userId == null || userId.isBlank()) {
                continue;
            }
            PmMaTicketAssignee assignee = new PmMaTicketAssignee();
            assignee.setMaTicket(ticket);
            assignee.setBusinessId(ticket.getBusinessId());
            assignee.setUserId(userId);
            ticketAssigneeRepository.save(assignee);
        }
    }

    private PmMaTicketResponse toResponse(PmMaTicket entity) {
        PmMaTicketResponse res = new PmMaTicketResponse();
        res.setId(entity.getId());
        res.setBusinessId(entity.getBusinessId());
        res.setTicketNo(entity.getTicketNo());
        res.setCustomerId(entity.getCustomerId());
        res.setProjectId(entity.getProjectId());
        res.setContractId(entity.getContractId());
        res.setTicketType(entity.getTicketType());
        res.setTitle(entity.getTitle());
        res.setDescription(entity.getDescription());
        res.setSeverity(entity.getSeverity());
        res.setStatus(entity.getStatus());
        res.setIsLocked(approvalService.isApproved("MA_TICKET", entity.getId()));
        res.setAssignedTo(entity.getAssignedTo());
        res.setAssignedToIds(entity.getId() != null
                ? ticketAssigneeRepository.findByMaTicketId(entity.getId()).stream()
                        .map(PmMaTicketAssignee::getUserId)
                        .collect(Collectors.toList())
                : Collections.emptyList());
        res.setReportedBy(entity.getReportedBy());
        res.setReportedDate(entity.getReportedDate());
        res.setTargetResponseDate(entity.getTargetResponseDate());
        res.setTargetResolveDate(entity.getTargetResolveDate());
        res.setResolvedDate(entity.getResolvedDate());
        res.setClosedDate(entity.getClosedDate());
        res.setStartDate(entity.getStartDate());
        res.setStartTime(entity.getStartTime());
        res.setEndDate(entity.getEndDate());
        res.setEndTime(entity.getEndTime());
        res.setResolutionSummary(entity.getResolutionSummary());

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
