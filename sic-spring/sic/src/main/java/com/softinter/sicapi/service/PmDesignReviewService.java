package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.PmDesignReviewRequest;
import com.softinter.sicapi.dto.request.PmReviewCommentRequest;
import com.softinter.sicapi.dto.response.PmDesignReviewResponse;
import com.softinter.sicapi.dto.response.PmReviewCommentResponse;
import com.softinter.sicapi.dto.response.ComboboxResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface PmDesignReviewService {
    Page<PmDesignReviewResponse> findAll(UUID businessId, UUID projectId, String status, String keyword, Pageable pageable);
    PmDesignReviewResponse findById(UUID id, UUID businessId);
    UUID save(PmDesignReviewRequest request, UUID businessId, String userId);
    void delete(UUID id, UUID businessId, String userId);
    PmReviewCommentResponse addComment(UUID reviewId, PmReviewCommentRequest request, UUID businessId, String userId);
    List<ComboboxResponse> getComboboxSpecifications(UUID businessId, UUID projectId, String type, String value);
    List<ComboboxResponse> getComboboxProjects(UUID businessId);
    List<ComboboxResponse> getComboboxRequirements(UUID businessId, UUID projectId);
    List<ComboboxResponse> getComboboxTasks(UUID businessId, UUID projectId);
    List<ComboboxResponse> getComboboxUsers(UUID businessId);
}

