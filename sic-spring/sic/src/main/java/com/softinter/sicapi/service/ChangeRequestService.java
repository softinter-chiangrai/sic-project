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
    PaginationResponse<ChangeRequestResponse> listChangeRequests(UUID projectId, String targetType, UUID targetId, String status, String keyword, Pageable pageable);
    void deleteChangeRequest(UUID id);

    /** ตัวเลือกเอกสารเป้าหมายของ CR: เฉพาะเอกสารที่อนุมัติแล้ว (ถ้าระบุ value คืนรายการเดียวเพื่อแสดงค่าที่เลือกไว้เดิม) */
    java.util.List<com.softinter.sicapi.dto.response.ComboboxResponse> getApprovedTargetCombobox(
            String targetType, UUID projectId, String keyword, UUID value);
    ChangeRequestResponse submitForApproval(UUID id);
    ChangeRequestResponse approve(UUID id, String approvedBy);
    ChangeRequestResponse reject(UUID id, String reason);
    ChangeRequestResponse implement(UUID id);
    ChangeRequestResponse markAssigneeComplete(UUID changeRequestId, String userId, UUID targetId);
}