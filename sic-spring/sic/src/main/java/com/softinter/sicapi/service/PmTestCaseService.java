package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.PmTestCaseRequest;
import com.softinter.sicapi.dto.response.PmTestCaseResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface PmTestCaseService {

    Page<PmTestCaseResponse> findAll(UUID businessId, UUID projectId, String keyword, Pageable pageable);

    PmTestCaseResponse findById(UUID id, UUID businessId);

    UUID save(PmTestCaseRequest request, UUID businessId, String userId);

    void delete(UUID id, UUID businessId, String userId);
}