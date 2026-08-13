package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.PmMaRenewalRequest;
import com.softinter.sicapi.dto.response.PmMaRenewalResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface PmMaRenewalService {
    Page<PmMaRenewalResponse> findAll(UUID businessId, UUID projectId, Pageable pageable);
    PmMaRenewalResponse findById(UUID id, UUID businessId);
    UUID save(PmMaRenewalRequest request, UUID businessId, String userId);
    void delete(UUID id, UUID businessId, String userId);
}
