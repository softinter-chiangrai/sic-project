package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.PmDesignReviewRequest;
import com.softinter.sicapi.dto.response.PmDesignReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface PmDesignReviewService {
    Page<PmDesignReviewResponse> findAll(UUID businessId, UUID projectId, String status, String keyword, Pageable pageable);
    PmDesignReviewResponse findById(UUID id, UUID businessId);
    UUID save(PmDesignReviewRequest request, UUID businessId, String userId);
    void delete(UUID id, UUID businessId, String userId);
}
