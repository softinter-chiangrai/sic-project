package com.softinter.sicapi.service.impl;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.dto.request.PmCustomerProjectRequest;
import com.softinter.sicapi.dto.response.PmCustomerProjectResponse;
import com.softinter.sicapi.entity.pm.PmCustomer;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.entity.su.SuBusiness;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmCustomerRepository;
import com.softinter.sicapi.repository.su.SuBusinessRepository;
import com.softinter.sicapi.service.PmCustomerProjectService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PmCustomerProjectServiceImpl implements PmCustomerProjectService {

    private final PmCustomerProjectRepository projectRepository;
    private final PmCustomerRepository customerRepository;
    private final SuBusinessRepository businessRepository;

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
        project.setBudgetManday(request.getBudgetManday());
        project.setUsedManday(request.getUsedManday() != null ? request.getUsedManday() : 0);
        project.setStatus(request.getStatus());
        project.setPriority(request.getPriority());
        project.setDescription(request.getDescription());
        project.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        project = projectRepository.save(project);
        return toResponse(project);
    }

    @Override
    @Transactional
    public PmCustomerProjectResponse update(UUID id, PmCustomerProjectRequest request) {
        PmCustomerProject project = projectRepository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

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
        return toResponse(project);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        PmCustomerProject project = projectRepository.findByIdAndIsDeleteFalse(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        project.setIsDelete(true);
        project.setIsActive(false);
        projectRepository.save(project);
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
        Page<PmCustomerProject> page;
        if (businessId != null) {
            page = projectRepository.findByCustomerIdAndBusinessIdAndIsDeleteFalse(customerId, businessId, pageable);
        } else {
            page = projectRepository.findByCustomerIdAndIsDeleteFalse(customerId, pageable);
        }
        return page.map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PmCustomerProjectResponse> searchByCustomerId(UUID customerId, UUID businessId, String keyword, Pageable pageable) {
        Page<PmCustomerProject> page;
        if (businessId != null) {
            page = projectRepository.findByCustomerIdAndBusinessIdAndIsDeleteFalseAndProjectNameContainingIgnoreCase(
                    customerId, businessId, keyword, pageable);
        } else {
            page = projectRepository.findByCustomerIdAndIsDeleteFalseAndProjectNameContainingIgnoreCase(customerId, keyword, pageable);
        }
        return page.map(this::toResponse);
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
        response.setUsedManday(project.getUsedManday());
        response.setStatus(project.getStatus());
        response.setPriority(project.getPriority());
        response.setDescription(project.getDescription());
        response.setIsActive(project.getIsActive());
        response.setCreatedDate(project.getCreatedDate());
        response.setUpdatedDate(project.getUpdatedDate());
        response.setRowVersion(project.getRowVersion());
        return response;
    }
}