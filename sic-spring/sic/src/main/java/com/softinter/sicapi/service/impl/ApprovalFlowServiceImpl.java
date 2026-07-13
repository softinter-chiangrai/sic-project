package com.softinter.sicapi.service.impl;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.dto.request.SaveApprovalFlowRequest;
import com.softinter.sicapi.dto.request.SaveApprovalFlowStepRequest;
import com.softinter.sicapi.dto.response.ApprovalFlowResponse;
import com.softinter.sicapi.dto.response.ApprovalFlowStepResponse;
import com.softinter.sicapi.entity.enums.ApprovalMode;
import com.softinter.sicapi.entity.enums.DocumentType;
import com.softinter.sicapi.entity.pm.PmApprovalFlow;
import com.softinter.sicapi.entity.pm.PmApprovalFlowStep;
import com.softinter.sicapi.exception.ResourceNotFoundException;
import com.softinter.sicapi.repository.pm.PmApprovalFlowRepository;
import com.softinter.sicapi.repository.pm.PmApprovalFlowStepRepository;
import com.softinter.sicapi.service.ApprovalFlowService;
import com.softinter.sicapi.service.CurrentUserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ApprovalFlowServiceImpl implements ApprovalFlowService {

    private final PmApprovalFlowRepository flowRepository;
    private final PmApprovalFlowStepRepository stepRepository;
    private final CurrentUserService currentUserService;

    @Override
    @Transactional(readOnly = true)
    public ApprovalFlowResponse getFlow(UUID flowId) {
        PmApprovalFlow flow = flowRepository.findById(flowId)
                .orElseThrow(() -> new ResourceNotFoundException("Approval flow not found"));
        return toResponse(flow);
    }

    @Override
    @Transactional(readOnly = true)
    public ApprovalFlowResponse getFlowByDocumentType(String documentType) {
        PmApprovalFlow flow = flowRepository.findByDocumentTypeAndIsActiveTrue(documentType)
                .orElseThrow(() -> new ResourceNotFoundException("No approval flow defined for " + documentType));
        return toResponse(flow);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApprovalFlowResponse> getAllFlows() {
        return flowRepository.findByIsActiveTrueOrderByFlowCode()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApprovalFlowResponse> getFlowsByDocumentType(String documentType) {
        return flowRepository.findByDocumentTypeAndIsActiveTrueOrderByFlowCode(documentType)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ApprovalFlowResponse getFlowByCode(String flowCode) {
        PmApprovalFlow flow = flowRepository.findByFlowCode(flowCode)
                .orElseThrow(() -> new ResourceNotFoundException("Approval flow not found: " + flowCode));
        return toResponse(flow);
    }
    @Override
@Transactional
public ApprovalFlowResponse createFlow(SaveApprovalFlowRequest request) {
    // ตรวจสอบรหัสซ้ำ
    if (flowRepository.findByFlowCode(request.getFlowCode()).isPresent()) {
        throw new IllegalArgumentException("Flow code already exists: " + request.getFlowCode());
    }

    PmApprovalFlow flow = new PmApprovalFlow();
    flow.setBusinessId(currentUserService.getBusinessId());
    flow.setFlowCode(request.getFlowCode());
    flow.setFlowName(request.getFlowName());
    flow.setDocumentType(request.getDocumentType());
    flow.setApprovalMode(request.getApprovalMode() != null ? request.getApprovalMode() : ApprovalMode.CHAIN);
    flow.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
    flow.setDescription(request.getDescription());
    flow.setCreatedBy(currentUserService.getUserId());

    flow = flowRepository.save(flow);

    // สร้าง Steps
    if (request.getSteps() != null) {
        for (SaveApprovalFlowStepRequest stepReq : request.getSteps()) {
            PmApprovalFlowStep step = new PmApprovalFlowStep();
            step.setFlow(flow);
            step.setStepOrder(stepReq.getStepOrder());
            step.setStepName(stepReq.getStepName());
            step.setApproverRole(stepReq.getApproverRole());
            step.setApproverUserId(stepReq.getApproverUserId());
            step.setIsRequired(stepReq.getIsRequired() != null ? stepReq.getIsRequired() : true);
            step.setTimeoutDays(stepReq.getTimeoutDays());
            step.setCanSkip(stepReq.getCanSkip() != null ? stepReq.getCanSkip() : false);
            step.setConditionExpression(stepReq.getConditionExpression());
            step.setCreatedBy(currentUserService.getUserId());
            stepRepository.save(step);
        }
    }

    return toResponse(flow);
}

@Override
@Transactional
public ApprovalFlowResponse updateFlow(UUID id, SaveApprovalFlowRequest request) {
    PmApprovalFlow flow = flowRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Approval flow not found"));

    // ตรวจสอบรหัสซ้ำ (ยกเว้นตัวเอง)
    flowRepository.findByFlowCode(request.getFlowCode())
            .ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new IllegalArgumentException("Flow code already exists: " + request.getFlowCode());
                }
            });

    flow.setFlowCode(request.getFlowCode());
    flow.setFlowName(request.getFlowName());
    flow.setDocumentType(request.getDocumentType());
    flow.setApprovalMode(request.getApprovalMode() != null ? request.getApprovalMode() : ApprovalMode.CHAIN);
    flow.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
    flow.setDescription(request.getDescription());
    flow.setUpdatedBy(currentUserService.getUserId());

    // จัดการ Steps: ลบเก่าแล้วสร้างใหม่ (ง่ายสุด)
    stepRepository.deleteByFlowId(id);

    if (request.getSteps() != null) {
        for (SaveApprovalFlowStepRequest stepReq : request.getSteps()) {
            PmApprovalFlowStep step = new PmApprovalFlowStep();
            step.setFlow(flow);
            step.setStepOrder(stepReq.getStepOrder());
            step.setStepName(stepReq.getStepName());
            step.setApproverRole(stepReq.getApproverRole());
            step.setApproverUserId(stepReq.getApproverUserId());
            step.setIsRequired(stepReq.getIsRequired() != null ? stepReq.getIsRequired() : true);
            step.setTimeoutDays(stepReq.getTimeoutDays());
            step.setCanSkip(stepReq.getCanSkip() != null ? stepReq.getCanSkip() : false);
            step.setConditionExpression(stepReq.getConditionExpression());
            step.setCreatedBy(currentUserService.getUserId());
            stepRepository.save(step);
        }
    }

    return toResponse(flow);
}

@Override
@Transactional
public void deleteFlow(UUID id) {
    PmApprovalFlow flow = flowRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Approval flow not found"));
    flow.setIsDelete(true);
    flow.setIsActive(false);
    flow.setDeleteBy(currentUserService.getUserId());
    flow.setDeleteDate(Instant.now());
    flowRepository.save(flow);
}

    private ApprovalFlowResponse toResponse(PmApprovalFlow flow) {
        ApprovalFlowResponse response = new ApprovalFlowResponse();
        response.setId(flow.getId());
        response.setFlowCode(flow.getFlowCode());
        response.setFlowName(flow.getFlowName());
        response.setDocumentType(flow.getDocumentType());
        response.setApprovalMode(flow.getApprovalMode());
        response.setApprovalModeDisplay(flow.getApprovalMode().getThaiName());
        response.setDescription(flow.getDescription());
        response.setActive(flow.getIsActive());

        // Document type display
        try {
            DocumentType docType = DocumentType.valueOf(flow.getDocumentType());
            response.setDocumentTypeDisplay(docType.getDisplayName());
        } catch (IllegalArgumentException e) {
            response.setDocumentTypeDisplay(flow.getDocumentType());
        }

        // Steps
        List<PmApprovalFlowStep> steps = stepRepository.findByFlowIdOrderByStepOrderAsc(flow.getId());
        response.setSteps(steps.stream()
                .map(this::toStepResponse)
                .collect(Collectors.toList()));

        return response;
    }

    private ApprovalFlowStepResponse toStepResponse(PmApprovalFlowStep step) {
        ApprovalFlowStepResponse response = new ApprovalFlowStepResponse();
        response.setId(step.getId());
        response.setStepOrder(step.getStepOrder());
        response.setStepName(step.getStepName());
        response.setApproverRole(step.getApproverRole());
        response.setApproverUserId(step.getApproverUserId());
        response.setIsRequired(step.getIsRequired());
        response.setTimeoutDays(step.getTimeoutDays());
        response.setCanSkip(step.getCanSkip());
        response.setConditionExpression(step.getConditionExpression());
        return response;
    }
}