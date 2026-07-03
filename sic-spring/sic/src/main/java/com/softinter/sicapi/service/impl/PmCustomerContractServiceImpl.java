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
import com.softinter.sicapi.service.PmCustomerContractService;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PmCustomerContractServiceImpl implements PmCustomerContractService {

    private final PmCustomerContractRepository contractRepository;
    private final PmCustomerProjectRepository projectRepository;

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
@Transactional(readOnly = true)
public UUID saveContract(UUID businessId, PmCustomerContractRequest request) {
    PmCustomerContract contract;
    if (request.getId() != null) {
        contract = contractRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("ไม่พบสัญญารหัส " + request.getId()));
        contract.setRowVersion(request.getRowVersion());
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
    contract.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

    contract = contractRepository.save(contract);
    
    // ✅ เก็บ contractId ไว้ในตัวแปร final ก่อนใช้ใน Lambda
    final UUID contractId = contract.getId();

    if (request.getProjectId() != null) {
        // เคลียร์ contractId ของโครงการเก่าที่เคยชี้มาที่สัญญานี้
        projectRepository.findByContractIdAndIsDeleteFalse(contractId)
                .forEach(p -> {
                    if (!p.getId().equals(request.getProjectId())) {
                        p.setContractId(null);
                        projectRepository.save(p);
                    }
                });

        // อัปเดตโครงการใหม่
        projectRepository.findById(request.getProjectId()).ifPresent(project -> {
            project.setContractId(contractId);
            projectRepository.save(project);
        });
    }

    return contractId; // หรือ return contract.getId() ก็ได้
}

    @Override
    public void deleteContract(UUID id) {
        PmCustomerContract contract = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ไม่พบสัญญารหัส " + id));
        contract.setIsDelete(true);
        contract.setIsActive(false);
        contractRepository.save(contract);
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
        // ถ้ามีความสัมพันธ์กับโครงการ
        projectRepository.findByContractIdAndIsDeleteFalse(contract.getId())
                .stream().findFirst()
                .ifPresent(p -> {
                    contract.setProjectId(p.getId());
                    dto.setProjectId(p.getId());
                    dto.setProjectName(p.getProjectName());
                });
        return dto;
    }
}