package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.PmUserManualRequest;
import com.softinter.sicapi.dto.response.PmUserManualResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface PmUserManualService {
    Page<PmUserManualResponse> findAll(UUID businessId, UUID projectId, Pageable pageable);
    PmUserManualResponse findById(UUID id, UUID businessId);
    UUID save(PmUserManualRequest request, UUID businessId, String userId);
    void delete(UUID id, UUID businessId, String userId);
}
