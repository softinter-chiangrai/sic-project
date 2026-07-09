package com.softinter.sicapi.service.impl;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.dto.response.ApprovalFlowResponse;
import com.softinter.sicapi.dto.response.ApprovalFlowStepResponse;
import com.softinter.sicapi.entity.enums.DocumentType;
import com.softinter.sicapi.entity.pm.PmApprovalFlow;
import com.softinter.sicapi.entity.pm.PmApprovalFlowStep;
import com.softinter.sicapi.exception.ResourceNotFoundException;
import com.softinter.sicapi.repository.pm.PmApprovalFlowRepository;
import com.softinter.sicapi.repository.pm.PmApprovalFlowStepRepository;
import com.softinter.sicapi.service.ApprovalFlowService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ApprovalFlowServiceImpl implements ApprovalFlowService {

    private final PmApprovalFlowRepository flowRepository;
    private final PmApprovalFlowStepRepository stepRepository;

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