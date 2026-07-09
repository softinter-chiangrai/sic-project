package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.SaveApprovalFlowRequest;
import com.softinter.sicapi.dto.response.ApprovalFlowResponse;

import java.util.List;
import java.util.UUID;

public interface ApprovalFlowService {

    ApprovalFlowResponse getFlow(UUID flowId);
    ApprovalFlowResponse getFlowByDocumentType(String documentType);
    List<ApprovalFlowResponse> getAllFlows();
    List<ApprovalFlowResponse> getFlowsByDocumentType(String documentType);
    ApprovalFlowResponse getFlowByCode(String flowCode);
    ApprovalFlowResponse createFlow(SaveApprovalFlowRequest request);
    ApprovalFlowResponse updateFlow(UUID id, SaveApprovalFlowRequest request);
    void deleteFlow(UUID id);
}