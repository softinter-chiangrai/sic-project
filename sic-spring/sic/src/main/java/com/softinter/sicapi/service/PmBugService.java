package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.PmBugRequest;
import com.softinter.sicapi.dto.response.PmBugResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface PmBugService {

    Page<PmBugResponse> findAll(UUID businessId, UUID projectId, String keyword, Pageable pageable);

    PmBugResponse findById(UUID id, UUID businessId);

    UUID save(PmBugRequest request, UUID businessId, String userId);

    void delete(UUID id, UUID businessId, String userId);
}