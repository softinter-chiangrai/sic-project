package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.PmRequirementRequest;
import com.softinter.sicapi.dto.response.PmRequirementResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface PmRequirementService {
    Page<PmRequirementResponse> findAll(UUID businessId, UUID projectId, String keyword, String status, Pageable pageable);
    PmRequirementResponse findById(UUID id, UUID businessId);
    UUID save(PmRequirementRequest request, UUID businessId, String userId);
    void delete(UUID id, UUID businessId, String userId);
}