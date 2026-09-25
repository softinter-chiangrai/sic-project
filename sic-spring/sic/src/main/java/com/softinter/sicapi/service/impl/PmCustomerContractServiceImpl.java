package com.softinter.sicapi.service.impl;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.dto.request.PmCustomerContractRequest;
import com.softinter.sicapi.dto.response.ComboboxResponse;
import com.softinter.sicapi.dto.response.PmCustomerContractResponse;
import com.softinter.sicapi.entity.enums.PaymentStatus;
import com.softinter.sicapi.entity.enums.MaTicketStatus;
import com.softinter.sicapi.entity.pm.PmCustomer;
import com.softinter.sicapi.entity.pm.PmCustomerContract;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.repository.pm.PmCustomerContractRepository;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmCustomerRepository;
import com.softinter.sicapi.repository.pm.PmMilestoneRepository;
import com.softinter.sicapi.repository.pm.PmInvoiceRepository;
import com.softinter.sicapi.repository.pm.PmMaTicketRepository;
import com.softinter.sicapi.dto.response.PmContractSummaryResponse;
import com.softinter.sicapi.service.ApprovalService;
import com.softinter.sicapi.service.DocumentVersionService;
import com.softinter.sicapi.service.PmCustomerContractService;
import com.softinter.sicapi.service.AuditLogService;
import com.softinter.sicapi.util.DocumentDiffHelper;
import com.softinter.sicapi.util.JsonSnapshotHelper;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PmCustomerContractServiceImpl implements PmCustomerContractService {

    private final PmCustomerContractRepository contractRepository;
    private final PmCustomerRepository customerRepository;
    private final PmCustomerProjectRepository projectRepository;
    private final DocumentVersionService documentVersionService;
    private final AuditLogService auditLogService;
    private final ApprovalService approvalService;
    private final PmMilestoneRepository milestoneRepository;
    private final PmInvoiceRepository invoiceRepository;
    private final PmMaTicketRepository maTicketRepository;

    private static final java.util.Map<String, String> SIGN_STATUS_THAI_MAP = java.util.Map.of(
            "ร่าง", "Draft",
            "ส่งแล้ว", "Sent",
            "ลงนาม", "Signed",
            "เซ็นสัญญา", "Signed",
            "หมดอายุ", "Expired"
    );

    @Override
    @Transactional(readOnly = true)
    public Page<PmCustomerContractResponse> getContracts(
            UUID businessId,
            String keyword,
            String status,
            String contractType,
            Pageable pageable) {
        return getContracts(businessId, null, null, keyword, status, contractType, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PmCustomerContractResponse> getContracts(
            UUID businessId,
            UUID customerId,
            UUID projectId,
            String keyword,
            String status,
            String contractType,
            Pageable pageable) {
        return getContracts(businessId, customerId, projectId, keyword, status, contractType, null, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PmCustomerContractResponse> getContracts(
            UUID businessId,
            UUID customerId,
            UUID projectId,
            String keyword,
            String status,
            String contractType,
            Integer expiringWithinDays,
            Pageable pageable) {

        Specification<PmCustomerContract> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("businessId"), businessId));
            predicates.add(cb.isFalse(root.get("isDelete")));

            if (customerId != null) {
                predicates.add(cb.equal(root.get("customerId"), customerId));
            }
            if (projectId != null) {
                predicates.add(cb.equal(root.get("projectId"), projectId));
            }
            if (keyword != null && !keyword.trim().isEmpty()) {
                String rawKw = keyword.trim().toLowerCase();
                String pattern = "%" + rawKw + "%";
                Join<PmCustomerContract, PmCustomer> customerJoin = root.join("customer", JoinType.LEFT);
                Join<PmCustomerContract, PmCustomerProject> projectJoin = root.join("project", JoinType.LEFT);

                Predicate contractNoPred = cb.like(cb.lower(root.get("contractNo")), pattern);
                Predicate contractTypePred = cb.like(cb.lower(root.get("contractType")), pattern);
                Predicate scopePred = cb.like(cb.lower(root.get("scopeSummary")), pattern);
                Predicate paymentPred = cb.like(cb.lower(root.get("paymentTerms")), pattern);
                Predicate signStatusPred = cb.like(cb.lower(root.get("signStatus")), pattern);
                Predicate custNameEnPred = cb.like(cb.lower(customerJoin.get("companyNameEn")), pattern);
                Predicate custNameLocalPred = cb.like(cb.lower(customerJoin.get("companyNameLocal")), pattern);
                Predicate custCodePred = cb.like(cb.lower(customerJoin.get("customerCode")), pattern);
                Predicate projNamePred = cb.like(cb.lower(projectJoin.get("projectName")), pattern);
                Predicate projCodePred = cb.like(cb.lower(projectJoin.get("projectCode")), pattern);

                List<Predicate> orPreds = new ArrayList<>(List.of(
                        contractNoPred, contractTypePred, scopePred, paymentPred, signStatusPred,
                        custNameEnPred, custNameLocalPred, custCodePred, projNamePred, projCodePred
                ));

                // ✅ Bilingual: สถานะลงนาม (ไทย ↔ อังกฤษ)
                for (var entry : SIGN_STATUS_THAI_MAP.entrySet()) {
                    if (rawKw.contains(entry.getKey()) || entry.getKey().contains(rawKw)) {
                        orPreds.add(cb.equal(cb.lower(root.get("signStatus")), entry.getValue().toLowerCase()));
                    }
                }

                // ✅ Bilingual: สถานะการอนุมัติ (join กับ pm_approval แบบ Polymorphic Document)
                com.softinter.sicapi.util.ApprovalKeywordSearchHelper.addApprovalKeywordPredicates(
                        query, cb, root.get("id"), "CONTRACT", rawKw, orPreds);

                predicates.add(cb.or(orPreds.toArray(new Predicate[0])));
            }
            if (status != null && !status.isBlank() && !"all".equals(status)) {
                predicates.add(cb.equal(root.get("signStatus"), status));
            }
            if (contractType != null && !contractType.isBlank() && !"all".equals(contractType)) {
                predicates.add(cb.equal(root.get("contractType"), contractType));
            }
            if (expiringWithinDays != null) {
                java.time.LocalDate today = java.time.LocalDate.now();
                java.time.LocalDate until = today.plusDays(expiringWithinDays);
                predicates.add(cb.between(root.get("endDate"), today, until));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        org.springframework.data.domain.Page<PmCustomerContract> page = contractRepository.findAll(spec, pageable);
        java.util.Map<java.util.UUID, String> versions = documentVersionService.getLatestVersionMap(
                "CONTRACT", page.getContent().stream().map(PmCustomerContract::getId).toList());
        return page.map(e -> {
            var dto = this.toResponse(e);
            dto.setVersion(versions.get(e.getId()));
            return dto;
        });
    }

    @Override
    @Transactional(readOnly = true)
    public PmCustomerContractResponse getContract(UUID id) {
        PmCustomerContract contract = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ไม่พบสัญญารหัส " + id));
        return toResponse(contract);
    }

    @Override
    @Transactional(readOnly = true)
    public PmContractSummaryResponse getContractSummary(UUID id) {
        PmCustomerContract contract = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ไม่พบสัญญารหัส " + id));

        UUID projectId = contract.getProjectId();

        long milestoneTotal = projectId != null ? milestoneRepository.countByProjectId(projectId) : 0;
        long milestoneCompleted = projectId != null ? milestoneRepository.countCompletedByProjectId(projectId) : 0;

        long invoiceTotal = projectId != null ? invoiceRepository.countByProjectIdAndIsDeleteFalse(projectId) : 0;
        long invoicePending = projectId != null
                ? invoiceRepository.countByProjectIdAndPaymentStatusInAndIsDeleteFalse(
                        projectId, java.util.List.of(PaymentStatus.UNPAID, PaymentStatus.PARTIAL, PaymentStatus.OVERDUE))
                : 0;

        long ticketTotal = projectId != null ? maTicketRepository.countByProjectIdAndIsDeleteFalse(projectId) : 0;
        long ticketOpen = projectId != null
                ? maTicketRepository.countByProjectIdAndStatusNotInAndIsDeleteFalse(
                        projectId, java.util.List.of(MaTicketStatus.RESOLVED, MaTicketStatus.CLOSED))
                : 0;

        Long daysUntilExpiry = contract.getEndDate() != null
                ? java.time.temporal.ChronoUnit.DAYS.between(java.time.LocalDate.now(), contract.getEndDate())
                : null;

        return PmContractSummaryResponse.builder()
                .milestones(PmContractSummaryResponse.MilestoneSummary.builder()
                        .total(milestoneTotal).completed(milestoneCompleted).build())
                .invoices(PmContractSummaryResponse.InvoiceSummary.builder()
                        .total(invoiceTotal).pending(invoicePending).build())
                .maTickets(PmContractSummaryResponse.MaTicketSummary.builder()
                        .total(ticketTotal).open(ticketOpen).build())
                .daysUntilExpiry(daysUntilExpiry)
                .build();
    }

    @Override
    @Transactional
    public UUID saveContract(UUID businessId, PmCustomerContractRequest request) {
        PmCustomerContract contract;
        boolean isNew = (request.getId() == null);
        String diffSummary = "สร้างสัญญาโครงการ (Initial contract)";
        String oldSignStatus = null;
        List<String> changes = new ArrayList<>();

        if (!isNew) {
            contract = contractRepository.findById(request.getId())
                    .orElseThrow(() -> new RuntimeException("ไม่พบสัญญารหัส " + request.getId()));
            approvalService.assertNotApproved("CONTRACT", contract.getId());
            contract.setRowVersion(request.getRowVersion());
            oldSignStatus = contract.getSignStatus();

            // ✅ Auto Diff Detection
            DocumentDiffHelper.checkChange(changes, "เลขที่สัญญา (Contract No)", contract.getContractNo(), request.getContractNo());
            DocumentDiffHelper.checkChange(changes, "ประเภทสัญญา (Type)", contract.getContractType(), request.getContractType());
            DocumentDiffHelper.checkChange(changes, "สถานะลงนาม (Sign Status)", contract.getSignStatus(), request.getSignStatus());
            DocumentDiffHelper.checkChange(changes, "มูลค่าสัญญา (Value)", contract.getContractValue(), request.getContractValue());
            DocumentDiffHelper.checkChange(changes, "เงื่อนไขการชำระเงิน (Payment Terms)", contract.getPaymentTerms(), request.getPaymentTerms());
            DocumentDiffHelper.checkChange(changes, "ขอบเขตงาน (Scope)", contract.getScopeSummary(), request.getScopeSummary());
            diffSummary = DocumentDiffHelper.buildDiffSummary(changes, "อัปเดตสัญญา " + (request.getContractNo() != null ? request.getContractNo() : ""));
        } else {
            contract = new PmCustomerContract();
            contract.setBusinessId(businessId);
            contract.setIsDelete(false);

            if (request.getContractNo() == null || request.getContractNo().isBlank()) {
                long count = contractRepository.countByProjectIdAndIsDeleteFalse(request.getProjectId()) + 1;
                request.setContractNo("CTR-" + String.format("%03d", count));
            } else if (contractRepository.existsByBusinessIdAndProjectIdAndContractNoAndIsDeleteFalse(
                    businessId, request.getProjectId(), request.getContractNo())) {
                throw new RuntimeException("เลขที่สัญญานี้มีอยู่แล้วในโครงการนี้: " + request.getContractNo());
            }
        }

        contract.setCustomerId(request.getCustomerId());
        // บันทึก projectId โดยตรงในสัญญา
        contract.setProjectId(request.getProjectId());

        contract.setContractNo(request.getContractNo());
        contract.setContractType(request.getContractType());
        contract.setStartDate(request.getStartDate());
        contract.setEndDate(request.getEndDate());
        contract.setContractValue(request.getContractValue());
        contract.setPaymentTerms(request.getPaymentTerms());
        contract.setScopeSummary(request.getScopeSummary());
        contract.setSignStatus(request.getSignStatus());
        contract.setRenewalStatus(request.getRenewalStatus());
        contract.setParentContractId(request.getParentContractId());
        contract.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        // แก้ไขเอกสารจริง (มี field เปลี่ยนแปลง) ขณะที่เคยอนุมัติ/ลงนามแล้ว หรือกำลังรออนุมัติอยู่
        // ต้องเปลี่ยนสถานะกลับเป็น "Changed" และยกเลิกคำขออนุมัติที่ค้างอยู่ (ถ้ามี) เพื่อขออนุมัติใหม่
        if (!isNew && !changes.isEmpty()) {
            boolean pendingInvalidated = approvalService.invalidatePendingApproval(
                    "CONTRACT", contract.getId(), "เอกสารถูกแก้ไขระหว่างรอการอนุมัติ");
            if ("Signed".equalsIgnoreCase(oldSignStatus) || pendingInvalidated) {
                contract.setSignStatus("Changed");
            }
        }

        contract = contractRepository.save(contract);

        // ✅ ถ้าเป็นการสร้างสัญญาใหม่จากการต่อสัญญา (มี parentContractId) ให้อัปเดตสัญญาเดิมเป็น "ต่อแล้ว"
        if (isNew && request.getParentContractId() != null) {
            contractRepository.findById(request.getParentContractId()).ifPresent(parent -> {
                parent.setRenewalStatus("ต่อแล้ว");
                contractRepository.save(parent);

                // บันทึกประวัติให้สัญญาเดิมด้วย โดยคงเลขเวอร์ชันเดิม (การต่อสัญญาไม่ใช่การแก้เนื้อหาสัญญาเดิม)
                documentVersionService.createVersion(
                        "CONTRACT",
                        parent.getId(),
                        parent.getProjectId(),
                        parent.getContractNo(),
                        documentVersionService.keepVersion(documentVersionService.getLatestVersionNo("CONTRACT", parent.getId())),
                        "ต่อสัญญาฉบับใหม่: " + request.getContractNo(),
                        null
                );
            });
        }

        // Snapshot data
        String snapshotJson = JsonSnapshotHelper.toJson(toResponse(contract));

        // ✅ Dynamic version calculation
        String targetVersion;
        if (isNew) {
            targetVersion = "v1.0.0";
        } else {
            String currentVer = documentVersionService.getVersions("CONTRACT", contract.getId())
                    .stream().findFirst().map(com.softinter.sicapi.dto.response.DocumentVersionResponse::getVersionNo).orElse("v1.0.0");
            targetVersion = documentVersionService.keepVersion(currentVer);
        }

        // ✅ Create document version
        documentVersionService.createVersion(
                "CONTRACT",
                contract.getId(),
                contract.getProjectId(),
                contract.getContractNo(),
                targetVersion,
                diffSummary,
                snapshotJson
        );
        
        // ✅ เก็บ contractId ไว้ในตัวแปร final ก่อนใช้ใน Lambda
        final UUID contractId = contract.getId();

        if (request.getProjectId() != null) {
            // เคลียร์ contractId ของโครงการเก่าที่เคยชี้มาที่สัญญานี้
            projectRepository.findByContractIdAndIsDeleteFalse(contractId)
                    .forEach(oldProject -> {
                        if (!oldProject.getId().equals(request.getProjectId())) {
                            oldProject.setContractId(null);
                            projectRepository.save(oldProject);
                        }
                    });

            // อัปเดต contractId ให้กับโครงการที่เลือก
            projectRepository.findById(request.getProjectId())
                    .ifPresent(newProject -> {
                        newProject.setContractId(contractId);
                        projectRepository.save(newProject);
                    });
        }

        logContractAudit(isNew, contract);

        return contract.getId();
    }

    private void logContractAudit(boolean isNew, PmCustomerContract contract) {
        try {
            String action = isNew ? "CREATE_CONTRACT" : "UPDATE_CONTRACT";
            String desc = isNew
                    ? "สร้างสัญญา: " + contract.getContractNo()
                    : "แก้ไขสัญญา: " + contract.getContractNo();
            auditLogService.log(action, "Contract Management", desc, "CONTRACT", contract.getId(), null, null, "Success", null);
        } catch (Exception e) {
            log.error("ผิดพลาด audit log contract: {}", e.getMessage(), e);
        }
    }

    @Override
    public void deleteContract(UUID id) {
        PmCustomerContract contract = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ไม่พบสัญญารหัส " + id));

        approvalService.assertNotApproved("CONTRACT", contract.getId());

        contract.setIsDelete(true);
        contract.setIsActive(false);
        contractRepository.save(contract);

        // ✅ Soft Delete Document Versions
        documentVersionService.deleteVersionsByDocument("CONTRACT", contract.getId());

        try {
            auditLogService.log("DELETE_CONTRACT", "Contract Management",
                    "ลบสัญญา: " + contract.getContractNo(),
                    "CONTRACT", contract.getId(), null, null, "Success", null);
        } catch (Exception e) {
            log.error("ผิดพลาด audit log DELETE_CONTRACT: {}", e.getMessage(), e);
        }
    }

    public static final String RENEWAL_STATUS_CANCELLED = "ยกเลิก";

    @Override
    @Transactional
    public PmCustomerContractResponse cancelContract(UUID id, String reason) {
        PmCustomerContract contract = contractRepository.findById(id)
                .filter(c -> !Boolean.TRUE.equals(c.getIsDelete()))
                .orElseThrow(() -> new RuntimeException("ไม่พบสัญญารหัส " + id));

        if (RENEWAL_STATUS_CANCELLED.equals(contract.getRenewalStatus())) {
            throw new IllegalStateException("สัญญานี้ถูกยกเลิกไปแล้ว");
        }

        // คำขออนุมัติที่ค้างอยู่ไม่มีความหมายแล้ว ต้องยกเลิกก่อน (สัญญาที่อนุมัติ/ลงนามแล้วยกเลิกได้ ไม่ถูกล็อกเหมือนการแก้ไข)
        approvalService.invalidatePendingApproval("CONTRACT", contract.getId(),
                "ยกเลิกสัญญา" + (reason != null && !reason.isBlank() ? ": " + reason.trim() : ""));

        contract.setRenewalStatus(RENEWAL_STATUS_CANCELLED);
        contract = contractRepository.save(contract);

        String summary = "ยกเลิกสัญญา " + contract.getContractNo()
                + (reason != null && !reason.isBlank() ? " เหตุผล: " + reason.trim() : "");
        try {
            String latest = documentVersionService.getLatestVersionNo("CONTRACT", contract.getId());
            documentVersionService.createVersion("CONTRACT", contract.getId(), contract.getProjectId(),
                    contract.getContractNo(), documentVersionService.keepVersion(latest), summary);
        } catch (Exception e) {
            log.error("ผิดพลาดสร้าง document version ตอนยกเลิกสัญญา: {}", e.getMessage(), e);
        }

        try {
            auditLogService.log("CANCEL_CONTRACT", "Contract Management", summary,
                    "CONTRACT", contract.getId(), null, null, "Success", null);
        } catch (Exception e) {
            log.error("ผิดพลาด audit log CANCEL_CONTRACT: {}", e.getMessage(), e);
        }

        return getContract(contract.getId());
    }

    @Override

    public List<ComboboxResponse> getLovContractTypes() {
        return Arrays.asList(
                new ComboboxResponse("Development Contract", "Development Contract"),
                new ComboboxResponse("Maintenance Contract", "Maintenance Contract"),
                new ComboboxResponse("Support Contract", "Support Contract"),
                new ComboboxResponse("Change Request Contract", "Change Request Contract"),
                new ComboboxResponse("Extension Contract", "Extension Contract")
        );
    }

    @Override
    public List<ComboboxResponse> getLovSignStatuses() {
        return Arrays.asList(
                new ComboboxResponse("Draft", "Draft"),
                new ComboboxResponse("Sent", "Sent"),
                new ComboboxResponse("Signed", "Signed"),
                new ComboboxResponse("Expired", "Expired")
        );
    }

    // ✅ Combobox Project (กรองตาม customerId ถ้ามี หรือดึงทั้งหมดของ business)
    @Override
    public List<ComboboxResponse> getComboboxProjects(UUID businessId, UUID customerId) {
        if (customerId == null) {
            Page<PmCustomerProject> projects = projectRepository.findByBusinessIdAndIsDeleteFalse(
                    businessId, PageRequest.of(0, 100)
            );
            return projects.getContent().stream()
                    .map(p -> new ComboboxResponse(p.getId().toString(), p.getProjectName()))
                    .collect(Collectors.toList());
        }

        Page<PmCustomerProject> projects = projectRepository.findByCustomerIdAndBusinessIdAndIsDeleteFalse(
                customerId, businessId, PageRequest.of(0, 100)
        );

        return projects.getContent().stream()
                .map(p -> new ComboboxResponse(p.getId().toString(), p.getProjectName()))
                .collect(Collectors.toList());
    }

    // ✅ Combobox Contract (กรองตาม projectId หรือ customerId หรือ businessId)
    @Override
    @Transactional(readOnly = true)
    public List<ComboboxResponse> getComboboxContracts(UUID businessId, UUID customerId, UUID projectId) {
        List<PmCustomerContract> contracts;

        // ถ้ามี projectId ให้ลองหา customerId หรือ contractId จากโปรเจกต์ก่อน
        if (projectId != null) {
            var projectOpt = projectRepository.findById(projectId);
            if (projectOpt.isPresent()) {
                PmCustomerProject project = projectOpt.get();
                if (customerId == null && project.getCustomerId() != null) {
                    customerId = project.getCustomerId();
                }
            }
        }

        if (customerId != null) {
            contracts = contractRepository.findByBusinessIdAndCustomerIdAndIsDeleteFalseOrderByCreatedDateDesc(businessId, customerId);
        } else {
            contracts = contractRepository.findByBusinessIdAndIsDeleteFalseOrderByCreatedDateDesc(businessId);
        }

        return contracts.stream()
                .map(c -> new ComboboxResponse(
                        c.getId().toString(),
                        (c.getContractNo() != null ? c.getContractNo() : "สัญญา") +
                        (c.getContractType() != null && !c.getContractType().isBlank() ? " (" + c.getContractType() + ")" : "")
                ))
                .collect(Collectors.toList());
    }

    // ===== แปลง Entity → DTO =====
    private PmCustomerContractResponse toResponse(PmCustomerContract contract) {
        PmCustomerContractResponse dto = new PmCustomerContractResponse();
        dto.setId(contract.getId());
        dto.setContractNo(contract.getContractNo());
        dto.setContractType(contract.getContractType());
        dto.setContractValue(contract.getContractValue());
        dto.setStartDate(contract.getStartDate());
        dto.setEndDate(contract.getEndDate());
        dto.setPaymentTerms(contract.getPaymentTerms());
        dto.setScopeSummary(contract.getScopeSummary());
        dto.setSignStatus(contract.getSignStatus());
        dto.setIsLocked(approvalService.isApproved("CONTRACT", contract.getId()));
        dto.setRenewalStatus(contract.getRenewalStatus());
        dto.setParentContractId(contract.getParentContractId());
        if (contract.getParentContract() != null) {
            dto.setParentContractNo(contract.getParentContract().getContractNo());
        } else if (contract.getParentContractId() != null) {
            contractRepository.findById(contract.getParentContractId())
                    .ifPresent(p -> dto.setParentContractNo(p.getContractNo()));
        }
        dto.setIsActive(contract.getIsActive());
        dto.setRowVersion(contract.getRowVersion());
        dto.setCreatedDate(contract.getCreatedDate());

        // ถ้ามีความสัมพันธ์กับลูกค้า
        if (contract.getCustomer() != null) {
            dto.setCustomerId(contract.getCustomer().getId());
            dto.setCustomerName(contract.getCustomer().getCompanyNameEn());
        } else if (contract.getCustomerId() != null) {
            dto.setCustomerId(contract.getCustomerId());
            // fallback: โหลด customerName จาก repository
            customerRepository.findById(contract.getCustomerId())
                    .ifPresent(c -> dto.setCustomerName(c.getCompanyNameEn()));
        }

        // ค้นหาโครงการ: ใช้ projectId จาก entity โดยตรง (เร็วกว่า findProjectForContract)
        if (contract.getProject() != null) {
            dto.setProjectId(contract.getProject().getId());
            dto.setProjectName(contract.getProject().getProjectName());
        } else if (contract.getProjectId() != null) {
            dto.setProjectId(contract.getProjectId());
            projectRepository.findById(contract.getProjectId())
                    .ifPresent(p -> dto.setProjectName(p.getProjectName()));
        } else {
            // fallback เดิม: ค้นหาโครงการที่ผูกกับสัญญา (สำหรับข้อมูลเก่าที่ยังไม่มี projectId)
            PmCustomerProject project = findProjectForContract(contract);
            if (project != null) {
                dto.setProjectId(project.getId());
                dto.setProjectName(project.getProjectName());
            }
        }
        return dto;
    }

    /**
     * ค้นหาโครงการที่ผูกกับสัญญา โดยค้นหาทั้งจากตัวสัญญาเอง, สัญญาต้นทาง (Parent Chain), และสัญญาต่ออายุปลายทาง (Child Chain)
     */
    private PmCustomerProject findProjectForContract(PmCustomerContract contract) {
        if (contract == null) return null;

        // 1. ค้นหาโดยตรงจาก contractId ที่ Project ชี้มา
        List<PmCustomerProject> directProjects = projectRepository.findByContractIdAndIsDeleteFalse(contract.getId());
        if (!directProjects.isEmpty()) {
            return directProjects.get(0);
        }

        // 2. ค้นหาย้อนขึ้นไปตามสาย Parent Contract (ถ้าเป็นฉบับต่ออายุ แล้วโครงการผูกไว้กับฉบับก่อนหน้า)
        UUID currentParentId = contract.getParentContractId();
        while (currentParentId != null) {
            List<PmCustomerProject> parentProjects = projectRepository.findByContractIdAndIsDeleteFalse(currentParentId);
            if (!parentProjects.isEmpty()) {
                return parentProjects.get(0);
            }
            PmCustomerContract parent = contractRepository.findById(currentParentId).orElse(null);
            currentParentId = (parent != null) ? parent.getParentContractId() : null;
        }

        // 3. ค้นหาลงไปตามสาย Child Contract (ถ้าเป็นฉบับเก่า แล้วโครงการถูกอัปเดตให้ชี้ไปที่ฉบับต่ออายุล่าสุด เช่น -R1, -R2)
        UUID currentChildId = contract.getId();
        while (currentChildId != null) {
            final UUID parentIdToFind = currentChildId;
            List<PmCustomerContract> children = contractRepository.findAll((root, query, cb) -> cb.and(
                    cb.equal(root.get("parentContractId"), parentIdToFind),
                    cb.isFalse(root.get("isDelete"))
            ));

            if (children.isEmpty()) {
                break;
            }

            PmCustomerProject found = null;
            for (PmCustomerContract child : children) {
                List<PmCustomerProject> childProjects = projectRepository.findByContractIdAndIsDeleteFalse(child.getId());
                if (!childProjects.isEmpty()) {
                    found = childProjects.get(0);
                    break;
                }
            }

            if (found != null) {
                return found;
            }

            // ถ้ายังไม่เจอ ให้ขยับลงไปดูลูกของลูกตัวแรก
            currentChildId = children.get(0).getId();
        }

        return null;
    }
}
