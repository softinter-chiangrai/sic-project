package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.ChangeRequestRequest;
import com.softinter.sicapi.dto.response.ChangeRequestResponse;
import com.softinter.sicapi.dto.response.PaginationResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ChangeRequestService {
    ChangeRequestResponse createChangeRequest(ChangeRequestRequest request);
    ChangeRequestResponse updateChangeRequest(UUID id, ChangeRequestRequest request);
    ChangeRequestResponse getChangeRequest(UUID id);
    PaginationResponse<ChangeRequestResponse> listChangeRequests(String targetType, UUID targetId, String status, Pageable pageable);
    void deleteChangeRequest(UUID id);
    ChangeRequestResponse submitForApproval(UUID id);
    ChangeRequestResponse approve(UUID id, String approvedBy);
    ChangeRequestResponse reject(UUID id, String reason);
    ChangeRequestResponse implement(UUID id);
    ChangeRequestResponse markAssigneeComplete(UUID changeRequestId, String userId, UUID targetId);
}