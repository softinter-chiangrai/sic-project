package com.softinter.sicapi.service.impl;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.dto.request.PmCustomerProjectRequest;
import com.softinter.sicapi.dto.response.PmCustomerProjectResponse;
import com.softinter.sicapi.entity.enums.ApprovalStatus;
import com.softinter.sicapi.entity.pm.PmApproval;
import com.softinter.sicapi.entity.pm.PmCustomer;
import com.softinter.sicapi.entity.pm.PmCustomerContract;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.entity.su.SuBusiness;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;
import java.util.Map;
import com.softinter.sicapi.repository.pm.PmApprovalRepository;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmCustomerRepository;
import com.softinter.sicapi.repository.pm.PmTaskRepository;
import com.softinter.sicapi.repository.su.SuBusinessRepository;
import com.softinter.sicapi.service.PmCustomerProjectService;
import com.softinter.sicapi.service.ApprovalService;
import com.softinter.sicapi.service.AuditLogService;

import com.softinter.sicapi.dto.response.DocumentVersionResponse;
import com.softinter.sicapi.service.DocumentVersionService;
import com.softinter.sicapi.util.DocumentDiffHelper;
import com.softinter.sicapi.util.JsonSnapshotHelper;
import java.util.ArrayList;
import java.util.List;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PmCustomerProjectServiceImpl implements PmCustomerProjectService {

    private final PmCustomerProjectRepository projectRepository;
    private final PmCustomerRepository customerRepository;
    private final SuBusinessRepository businessRepository;
    private final PmApprovalRepository approvalRepository;
    private final PmTaskRepository taskRepository;
    private final ApprovalService approvalService;
    private final AuditLogService auditLogService;
    private final DocumentVersionService documentVersionService;

    @Override
    @Transactional
    public PmCustomerProjectResponse create(UUID businessId, PmCustomerProjectRequest request) {
        PmCustomer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        SuBusiness business = businessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found"));

        PmCustomerProject project = new PmCustomerProject();
        project.setBusinessId(businessId);
        project.setCustomerId(request.getCustomerId());
        project.setContractId(request.getContractId());  // ✅ ตั้งค่า contractId
        project.setProjectCode(request.getProjectCode());
        project.setProjectName(request.getProjectName());
        project.setStartDate(request.getStartDate());
        project.setPlannedEndDate(request.getPlannedEndDate());
        project.setActualEndDate(request.getActualEndDate());
        project.setBudgetManday(request.getBudgetManday() != null ? request.getBudgetManday() : 0);
        project.setUsedManday(request.getUsedManday() != null ? request.getUsedManday() : 0);
        project.setStatus(request.getStatus() != null ? request.getStatus() : "Prospect");
        project.setPriority(request.getPriority() != null ? request.getPriority() : "Medium");
        project.setDescription(request.getDescription());
        project.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        project = projectRepository.saveAndFlush(project);

        PmCustomerProjectResponse response = toResponse(project);

        // ✅ Create Initial Document Version
        try {
            documentVersionService.createVersion(
                    "PROJECT",
                    project.getId(),
                    project.getId(),
                    project.getProjectCode(),
                    "v1.0.0",
                    "สร้างโปรเจกต์เริ่มต้น (Initial project)",
                    JsonSnapshotHelper.toJson(response)
            );
        } catch (Exception e) {
            log.error("Error creating document version on create project: {}", e.getMessage(), e);
        }

        try {
            auditLogService.log("CREATE_PROJECT", "Project Management",
                    "สร้างโปรเจกต์: " + project.getProjectName() + " (" + project.getProjectCode() + ")",
                    "PROJECT", project.getId(), null, null, "Success", null);
        } catch (Exception e) {
            log.error("ผิดพลาด audit log CREATE_PROJECT: {}", e.getMessage(), e);
        }

        return response;
    }

    @Override
    @Transactional
    public PmCustomerProjectResponse update(UUID id, PmCustomerProjectRequest request) {
        PmCustomerProject project = projectRepository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // ✅ ป้องกันการแก้ไขโดยตรงหากผ่านการอนุมัติแล้ว (Baseline Locked)
        approvalService.assertNotApproved("PROJECT", project.getId());

        List<String> changes = new ArrayList<>();
        DocumentDiffHelper.checkChange(changes, "รหัสโครงการ (Project Code)", project.getProjectCode(), request.getProjectCode());
        DocumentDiffHelper.checkChange(changes, "ชื่อโครงการ (Project Name)", project.getProjectName(), request.getProjectName());
        DocumentDiffHelper.checkChange(changes, "สถานะ (Status)", project.getStatus(), request.getStatus());
        DocumentDiffHelper.checkChange(changes, "ความสำคัญ (Priority)", project.getPriority(), request.getPriority());
        DocumentDiffHelper.checkChange(changes, "คำอธิบาย (Description)", project.getDescription(), request.getDescription());

        if (!changes.isEmpty()) {
            approvalService.invalidatePendingApproval("PROJECT", project.getId(), "เอกสารถูกแก้ไขระหว่างรอการอนุมัติ");
        }

        project.setProjectCode(request.getProjectCode());
        project.setProjectName(request.getProjectName());
        project.setContractId(request.getContractId());  // ✅ อัปเดต contractId
        project.setStartDate(request.getStartDate());
        project.setPlannedEndDate(request.getPlannedEndDate());
        project.setActualEndDate(request.getActualEndDate());
        project.setBudgetManday(request.getBudgetManday());
        project.setUsedManday(request.getUsedManday() != null ? request.getUsedManday() : project.getUsedManday());
        project.setStatus(request.getStatus());
        project.setPriority(request.getPriority());
        project.setDescription(request.getDescription());
        if (request.getIsActive() != null) {
            project.setIsActive(request.getIsActive());
        }

        project = projectRepository.save(project);

        // ✅ Dynamic Increment Version
        try {
            String currentVer = documentVersionService.getVersions("PROJECT", project.getId())
                    .stream().findFirst().map(DocumentVersionResponse::getVersionNo).orElse("v1.0.0");
            String nextVer = documentVersionService.keepVersion(currentVer);
            String diffSummary = DocumentDiffHelper.buildDiffSummary(changes, "แก้ไขโปรเจกต์: " + project.getProjectName());
            documentVersionService.createVersion(
                    "PROJECT",
                    project.getId(),
                    project.getId(),
                    project.getProjectCode(),
                    nextVer,
                    diffSummary,
                    JsonSnapshotHelper.toJson(toResponse(project))
            );
        } catch (Exception e) {
            log.error("Error creating document version on update project: {}", e.getMessage(), e);
        }

        try {
            auditLogService.log("UPDATE_PROJECT", "Project Management",
                    "แก้ไขโปรเจกต์: " + project.getProjectName() + " (" + project.getProjectCode() + ")",
                    "PROJECT", project.getId(), null, null, "Success", null);
        } catch (Exception e) {
            log.error("ผิดพลาด audit log UPDATE_PROJECT: {}", e.getMessage(), e);
        }

        return toResponse(project);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        PmCustomerProject project = projectRepository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        approvalService.assertNotApproved("PROJECT", project.getId());

        project.setIsDelete(true);
        project.setIsActive(false);
        projectRepository.save(project);

        // ✅ Soft Delete Document Versions
        documentVersionService.deleteVersionsByDocument("PROJECT", project.getId());

        try {
            auditLogService.log("DELETE_PROJECT", "Project Management",
                    "ลบโปรเจกต์: " + project.getProjectName() + " (" + project.getProjectCode() + ")",
                    "PROJECT", project.getId(), null, null, "Success", null);
        } catch (Exception e) {
            log.error("ผิดพลาด audit log DELETE_PROJECT: {}", e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PmCustomerProjectResponse findById(UUID id) {
        PmCustomerProject project = projectRepository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        return toResponse(project);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PmCustomerProjectResponse> findByCustomerId(UUID customerId, UUID businessId, Pageable pageable) {
        return getProjects(businessId, customerId, null, null, null, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PmCustomerProjectResponse> searchByCustomerId(UUID customerId, UUID businessId, String keyword, Pageable pageable) {
        return getProjects(businessId, customerId, keyword, null, null, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PmCustomerProjectResponse> findAllByBusinessId(UUID businessId, String keyword, Pageable pageable) {
        return getProjects(businessId, null, keyword, null, null, pageable);
    }

    private static final Map<String, List<String>> STATUS_THAI_MAP = Map.ofEntries(
            Map.entry("โอกาส", List.of("Prospect")),
            Map.entry("ร่างสัญญา", List.of("Contract Drafting")),
            Map.entry("เซ็นสัญญา", List.of("Contract Signed")),
            Map.entry("ลงนาม", List.of("Contract Signed")),
            Map.entry("รวบรวม", List.of("Requirement Gathering")),
            Map.entry("ความต้องการ", List.of("Requirement Gathering", "Requirement Approval")),
            Map.entry("อนุมัติความต้องการ", List.of("Requirement Approval")),
            Map.entry("วิเคราะห์", List.of("System Analysis")),
            Map.entry("dfd", List.of("DFD Design")),
            Map.entry("er", List.of("ER Design")),
            Map.entry("ข้อกำหนด", List.of("Specification Design", "Specification Approval")),
            Map.entry("วางแผน", List.of("Planning")),
            Map.entry("พัฒนา", List.of("Development")),
            Map.entry("กำลังพัฒนา", List.of("Development")),
            Map.entry("ทดสอบ", List.of("Internal Testing", "UAT")),
            Map.entry("ตรวจรับ", List.of("UAT")),
            Map.entry("uat", List.of("UAT")),
            Map.entry("บั๊ก", List.of("Bug Fixing")),
            Map.entry("bug", List.of("Bug Fixing")),
            Map.entry("พร้อมส่งมอบ", List.of("Ready for Delivery")),
            Map.entry("ส่งมอบ", List.of("Delivered", "Ready for Delivery")),
            Map.entry("วางบิล", List.of("Invoicing")),
            Map.entry("แจ้งหนี้", List.of("Invoicing")),
            Map.entry("ปิด", List.of("Closed")),
            Map.entry("บำรุงรักษา", List.of("MA Active")),
            Map.entry("ma", List.of("MA Active"))
    );

    private static final Map<String, String> PRIORITY_THAI_MAP = Map.of(
            "ต่ำ", "Low",
            "กลาง", "Medium",
            "ปานกลาง", "Medium",
            "สูง", "High",
            "วิกฤต", "Critical",
            "ด่วน", "Critical"
    );

    @Override
    @Transactional(readOnly = true)
    public Page<PmCustomerProjectResponse> getProjects(
            UUID businessId,
            UUID customerId,
            String keyword,
            String status,
            String priority,
            Pageable pageable) {

        Specification<PmCustomerProject> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Always filter out soft-deleted projects
            predicates.add(cb.isFalse(root.get("isDelete")));

            if (businessId != null) {
                predicates.add(cb.equal(root.get("businessId"), businessId));
            }

            if (customerId != null) {
                predicates.add(cb.equal(root.get("customerId"), customerId));
            }

            // Direct Status filter
            if (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status)) {
                String cleanStatus = status.trim().toLowerCase();
                List<String> mapped = STATUS_THAI_MAP.get(cleanStatus);
                if (mapped != null && !mapped.isEmpty()) {
                    List<Predicate> stPreds = new ArrayList<>();
                    for (String m : mapped) {
                        stPreds.add(cb.equal(cb.lower(root.get("status")), m.toLowerCase()));
                    }
                    predicates.add(cb.or(stPreds.toArray(new Predicate[0])));
                } else {
                    predicates.add(cb.equal(cb.lower(root.get("status")), cleanStatus));
                }
            }

            // Direct Priority filter
            if (priority != null && !priority.isBlank() && !"all".equalsIgnoreCase(priority)) {
                String cleanPriority = priority.trim().toLowerCase();
                String mappedPr = PRIORITY_THAI_MAP.get(cleanPriority);
                if (mappedPr != null) {
                    predicates.add(cb.equal(cb.lower(root.get("priority")), mappedPr.toLowerCase()));
                } else {
                    predicates.add(cb.equal(cb.lower(root.get("priority")), cleanPriority));
                }
            }

            // Keyword search across all columns + Thai translations + Approval status
            if (keyword != null && !keyword.trim().isEmpty()) {
                String rawKw = keyword.trim().toLowerCase();
                String pattern = "%" + rawKw + "%";
                Join<PmCustomerProject, PmCustomer> customerJoin = root.join("customer", JoinType.LEFT);
                Join<PmCustomerProject, PmCustomerContract> contractJoin = root.join("contract", JoinType.LEFT);

                List<Predicate> orPreds = new ArrayList<>();
                orPreds.add(cb.like(cb.lower(root.get("projectName")), pattern));
                orPreds.add(cb.like(cb.lower(root.get("projectCode")), pattern));
                orPreds.add(cb.like(cb.lower(root.get("description")), pattern));
                orPreds.add(cb.like(cb.lower(root.get("status")), pattern));
                orPreds.add(cb.like(cb.lower(root.get("priority")), pattern));
                orPreds.add(cb.like(cb.lower(customerJoin.get("companyNameEn")), pattern));
                orPreds.add(cb.like(cb.lower(customerJoin.get("companyNameLocal")), pattern));
                orPreds.add(cb.like(cb.lower(customerJoin.get("customerCode")), pattern));
                orPreds.add(cb.like(cb.lower(contractJoin.get("contractNo")), pattern));

                // 1. Match Thai Status words
                for (var entry : STATUS_THAI_MAP.entrySet()) {
                    if (rawKw.contains(entry.getKey()) || entry.getKey().contains(rawKw)) {
                        for (String mappedStatus : entry.getValue()) {
                            orPreds.add(cb.equal(cb.lower(root.get("status")), mappedStatus.toLowerCase()));
                        }
                    }
                }

                // 2. Match Thai Priority words
                for (var entry : PRIORITY_THAI_MAP.entrySet()) {
                    if (rawKw.contains(entry.getKey()) || entry.getKey().contains(rawKw)) {
                        orPreds.add(cb.equal(cb.lower(root.get("priority")), entry.getValue().toLowerCase()));
                    }
                }

                // 3. Match Approval Status words
                if (rawKw.contains("ยังไม่อนุมัติ") || rawKw.contains("ยังไม่ได้อนุมัติ") || rawKw.contains("unapproved") || rawKw.contains("not approved")) {
                    Subquery<UUID> approvedSub = query.subquery(UUID.class);
                    Root<PmApproval> approvedRoot = approvedSub.from(PmApproval.class);
                    approvedSub.select(approvedRoot.get("documentId"))
                            .where(
                                    cb.equal(approvedRoot.get("documentType"), "PROJECT"),
                                    cb.isFalse(approvedRoot.get("isDelete")),
                                    cb.equal(approvedRoot.get("status"), ApprovalStatus.APPROVED)
                            );
                    orPreds.add(cb.not(root.get("id").in(approvedSub)));
                } else if (rawKw.contains("อนุมัติแล้ว") || rawKw.contains("ผ่านการอนุมัติ") || rawKw.equals("อนุมัติ") || rawKw.equals("approved")) {
                    Subquery<UUID> appSub = query.subquery(UUID.class);
                    Root<PmApproval> appRoot = appSub.from(PmApproval.class);
                    appSub.select(appRoot.get("documentId"))
                            .where(
                                    cb.equal(appRoot.get("documentType"), "PROJECT"),
                                    cb.isFalse(appRoot.get("isDelete")),
                                    cb.equal(appRoot.get("status"), ApprovalStatus.APPROVED)
                            );
                    orPreds.add(root.get("id").in(appSub));
                } else if (rawKw.contains("รออนุมัติ") || rawKw.contains("pending")) {
                    Subquery<UUID> appSub = query.subquery(UUID.class);
                    Root<PmApproval> appRoot = appSub.from(PmApproval.class);
                    appSub.select(appRoot.get("documentId"))
                            .where(
                                    cb.equal(appRoot.get("documentType"), "PROJECT"),
                                    cb.isFalse(appRoot.get("isDelete")),
                                    cb.equal(appRoot.get("status"), ApprovalStatus.PENDING)
                            );
                    orPreds.add(root.get("id").in(appSub));
                } else if (rawKw.contains("ปฏิเสธ") || rawKw.contains("ไม่อนุมัติ") || rawKw.contains("rejected")) {
                    Subquery<UUID> appSub = query.subquery(UUID.class);
                    Root<PmApproval> appRoot = appSub.from(PmApproval.class);
                    appSub.select(appRoot.get("documentId"))
                            .where(
                                    cb.equal(appRoot.get("documentType"), "PROJECT"),
                                    cb.isFalse(appRoot.get("isDelete")),
                                    cb.equal(appRoot.get("status"), ApprovalStatus.REJECTED)
                            );
                    orPreds.add(root.get("id").in(appSub));
                }

                predicates.add(cb.or(orPreds.toArray(new Predicate[0])));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        org.springframework.data.domain.Page<PmCustomerProject> page = projectRepository.findAll(spec, pageable);
        java.util.Map<java.util.UUID, String> versions = documentVersionService.getLatestVersionMap(
                "PROJECT", page.getContent().stream().map(PmCustomerProject::getId).toList());
        return page.map(e -> {
            var dto = this.toResponse(e);
            dto.setVersion(versions.get(e.getId()));
            return dto;
        });
    }


    private PmCustomerProjectResponse toResponse(PmCustomerProject project) {
        PmCustomerProjectResponse response = new PmCustomerProjectResponse();
        response.setId(project.getId());
        response.setCustomerId(project.getCustomerId());
        response.setBusinessId(project.getBusinessId());

        // ✅ ตั้งชื่อลูกค้า (ถ้ามี)
        if (project.getCustomer() != null) {
            response.setCustomerName(project.getCustomer().getCompanyNameEn());
        }

        // ✅ ตั้ง contractId และ contractNo (ถ้ามี)
        response.setContractId(project.getContractId());
        if (project.getContract() != null) {
            response.setContractNo(project.getContract().getContractNo());
        }

        response.setProjectCode(project.getProjectCode());
        response.setProjectName(project.getProjectName());
        response.setStartDate(project.getStartDate());
        response.setPlannedEndDate(project.getPlannedEndDate());
        response.setActualEndDate(project.getActualEndDate());
        response.setBudgetManday(project.getBudgetManday());

        // ✅ คำนวณ usedManday แบบ Auto-Rollup จาก Task ทั้งหมดในโครงการ
        int taskUsedManday = 0;
        if (project.getId() != null) {
            try {
                Integer sum = taskRepository.sumActualMandayByProjectId(project.getId());
                taskUsedManday = sum != null ? sum : 0;
            } catch (Exception e) {
                log.warn("Failed to calculate usedManday for project {}: {}", project.getId(), e.getMessage());
            }
        }
        response.setUsedManday(taskUsedManday > 0 ? taskUsedManday : (project.getUsedManday() != null ? project.getUsedManday() : 0));

        response.setStatus(project.getStatus());
        response.setPriority(project.getPriority());
        response.setDescription(project.getDescription());
        response.setIsActive(project.getIsActive());
        response.setCreatedDate(project.getCreatedDate());
        response.setUpdatedDate(project.getUpdatedDate());
        response.setRowVersion(project.getRowVersion());

        // ✅ ตรวจสอบสถานะการอนุมัติ (Approval Status)
        try {
            var approvals = approvalRepository.findByDocument("PROJECT", project.getId());
            if (!approvals.isEmpty()) {
                var latest = approvals.get(0);
                response.setApprovalStatus(latest.getStatus() != null ? latest.getStatus().name() : null);
                response.setIsApproved(latest.getStatus() == com.softinter.sicapi.entity.enums.ApprovalStatus.APPROVED);
            } else {
                response.setApprovalStatus(null);
                response.setIsApproved(false);
            }
        } catch (Exception e) {
            log.warn("Failed to check approval status for project {}: {}", project.getId(), e.getMessage());
        }

        return response;
    }
}