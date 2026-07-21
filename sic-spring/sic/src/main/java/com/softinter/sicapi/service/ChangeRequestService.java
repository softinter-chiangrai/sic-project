package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.ChangeRequestRequest;
import com.softinter.sicapi.dto.response.ChangeRequestResponse;
import com.softinter.sicapi.dto.response.PaginationResponse;
import org.springframework.data.jpa.domain.Specification;
import com.softinter.sicapi.entity.pm.PmRequirementChangeRequest;

import java.util.UUID;

public interface ChangeRequestService {

    PaginationResponse<ChangeRequestResponse> getChangeRequests(
            Specification<PmRequirementChangeRequest> spec,
            int page,
            int size
    );

    ChangeRequestResponse getChangeRequestById(UUID id);

    UUID createChangeRequest(ChangeRequestRequest request);

    UUID updateChangeRequest(UUID id, ChangeRequestRequest request);

    void deleteChangeRequest(UUID id);

    ChangeRequestResponse toResponse(PmRequirementChangeRequest entity);
}