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
import com.softinter.sicapi.entity.pm.PmCustomerContract;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.repository.pm.PmCustomerContractRepository;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmCustomerRepository;
import com.softinter.sicapi.service.DocumentVersionService;
import com.softinter.sicapi.service.PmCustomerContractService;
import com.softinter.sicapi.service.AuditLogService;
import com.softinter.sicapi.util.DocumentDiffHelper;
import com.softinter.sicapi.util.JsonSnapshotHelper;

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

    @Override
    @Transactional(readOnly = true)
    public Page<PmCustomerContractResponse> getContracts(
            UUID businessId,
            String keyword,
            String status,
            String contractType,
            Pageable pageable) {

        Specification<PmCustomerContract> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("businessId"), businessId));
            predicates.add(cb.isFalse(root.get("isDelete")));

            if (keyword != null && !keyword.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("contractNo")), "%" + keyword.toLowerCase() + "%"));
            }
            if (status != null && !status.isBlank() && !"all".equals(status)) {
                predicates.add(cb.equal(root.get("signStatus"), status));
            }
            if (contractType != null && !contractType.isBlank() && !"all".equals(contractType)) {
                predicates.add(cb.equal(root.get("contractType"), contractType));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return contractRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PmCustomerContractResponse getContract(UUID id) {
        PmCustomerContract contract = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ไม่พบสัญญารหัส " + id));
        return toResponse(contract);
    }

    @Override
    @Transactional
    public UUID saveContract(UUID businessId, PmCustomerContractRequest request) {
        PmCustomerContract contract;
        boolean isNew = (request.getId() == null);
        String diffSummary = "สร้างสัญญาโครงการ (Initial contract)";

        if (!isNew) {
            contract = contractRepository.findById(request.getId())
                    .orElseThrow(() -> new RuntimeException("ไม่พบสัญญารหัส " + request.getId()));
            contract.setRowVersion(request.getRowVersion());

            // ✅ Auto Diff Detection
            List<String> changes = new ArrayList<>();
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
        }

        contract.setCustomerId(request.getCustomerId());
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

        contract = contractRepository.save(contract);

        // ✅ ถ้าเป็นการสร้างสัญญาใหม่จากการต่อสัญญา (มี parentContractId) ให้อัปเดตสัญญาเดิมเป็น "ต่อแล้ว"
        if (isNew && request.getParentContractId() != null) {
            contractRepository.findById(request.getParentContractId()).ifPresent(parent -> {
                parent.setRenewalStatus("ต่อแล้ว");
                contractRepository.save(parent);

                // บันทึก Version/Audit Log ให้สัญญาเดิมด้วย
                documentVersionService.createVersion(
                        "CONTRACT",
                        parent.getId(),
                        parent.getProjectId(),
                        parent.getContractNo(),
                        "v-renewed",
                        "ต่อสัญญาฉบับใหม่: " + request.getContractNo(),
                        null
                );
            });
        }

        // Snapshot data
        String snapshotJson = JsonSnapshotHelper.toJson(toResponse(contract));

        // ✅ Create document version
        documentVersionService.createVersion(
                "CONTRACT",
                contract.getId(),
                contract.getProjectId(),
                contract.getContractNo(),
                isNew ? "v1.0" : "v1.1",
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
        contract.setIsDelete(true);
        contract.setIsActive(false);
        contractRepository.save(contract);

        try {
            auditLogService.log("DELETE_CONTRACT", "Contract Management",
                    "ลบสัญญา: " + contract.getContractNo(),
                    "CONTRACT", contract.getId(), null, null, "Success", null);
        } catch (Exception e) {
            log.error("ผิดพลาด audit log DELETE_CONTRACT: {}", e.getMessage(), e);
        }
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

    // ✅ Combobox Project (กรองตาม customerId)
    @Override
    public List<ComboboxResponse> getComboboxProjects(UUID businessId, UUID customerId) {
        if (customerId == null) {
            return Collections.emptyList();
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
        }
        // ค้นหาโครงการที่ผูกกับสัญญา (รองรับทั้งสัญญาตั้งต้นและสัญญาที่มีการต่ออายุ)
        PmCustomerProject project = findProjectForContract(contract);
        if (project != null) {
            dto.setProjectId(project.getId());
            dto.setProjectName(project.getProjectName());
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
