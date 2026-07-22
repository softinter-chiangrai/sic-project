package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.PmSpecificationRequest;
import com.softinter.sicapi.dto.response.PmSpecificationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface PmSpecificationService {

    Page<PmSpecificationResponse> findAll(UUID businessId, UUID projectId, String keyword, Pageable pageable);

    PmSpecificationResponse findById(UUID id, UUID businessId);

    UUID save(PmSpecificationRequest request, UUID businessId, String userId);

    void delete(UUID id, UUID businessId, String userId);
}