package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.PmDesignReviewRequest;
import com.softinter.sicapi.dto.response.PmDesignReviewResponse;
import com.softinter.sicapi.dto.response.PmReviewCommentResponse;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.entity.pm.PmDesignReview;
import com.softinter.sicapi.entity.pm.PmReviewComment;

import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmDesignReviewRepository;
import com.softinter.sicapi.repository.pm.PmReviewCommentRepository;
import com.softinter.sicapi.service.PmDesignReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PmDesignReviewServiceImpl implements PmDesignReviewService {

    private final PmDesignReviewRepository designReviewRepository;
    private final PmReviewCommentRepository reviewCommentRepository;
    private final PmCustomerProjectRepository projectRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<PmDesignReviewResponse> findAll(UUID businessId, UUID projectId, String status, String keyword, Pageable pageable) {
        Page<PmDesignReview> page = designReviewRepository.findReviews(businessId, projectId, status, keyword, pageable);
        return page.map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PmDesignReviewResponse findById(UUID id, UUID businessId) {
        PmDesignReview entity = designReviewRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new RuntimeException("Design review not found"));

        PmDesignReviewResponse response = mapToResponse(entity);
        List<PmReviewComment> comments = reviewCommentRepository.findByReviewId(id);
        response.setComments(comments.stream().map(this::mapCommentToResponse).collect(Collectors.toList()));
        return response;
    }

    @Override
    @Transactional
    public UUID save(PmDesignReviewRequest request, UUID businessId, String userId) {
        PmDesignReview entity;

        if (request.getId() != null) {
            entity = designReviewRepository.findByIdAndBusinessId(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("Design review not found"));
            entity.setUpdatedBy(userId);
            entity.setUpdatedDate(Instant.now());
        } else {
            entity = new PmDesignReview();
            entity.setBusinessId(businessId);
            entity.setCreatedBy(userId);
            entity.setCreatedDate(Instant.now());
            entity.setUpdatedBy(userId);
            entity.setUpdatedDate(Instant.now());
            entity.setIsDelete(false);
        }

        PmCustomerProject project = projectRepository.findByIdAndIsDeleteFalse(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        entity.setProject(project);
        entity.setReviewCode(request.getReviewCode());
        entity.setTitle(request.getTitle());
        entity.setDescription(request.getDescription());
        entity.setReviewItemType(request.getReviewableType());
        entity.setReviewItemId(request.getReviewableId() != null ? request.getReviewableId() : UUID.randomUUID());
        entity.setReviewer(request.getReviewer());
        entity.setAssignedTo(request.getAssignedTo());
        entity.setSeverity(request.getSeverity());
        entity.setStatus(request.getStatus());
        entity.setDueDate(request.getDueDate());
        entity.setFigmaUrl(request.getFigmaUrl());
        entity.setEmbedMode(request.getEmbedMode());
        entity.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        PmDesignReview saved = designReviewRepository.save(entity);
        return saved.getId();
    }

    @Override
    @Transactional
    public void delete(UUID id, UUID businessId, String userId) {
        PmDesignReview entity = designReviewRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new RuntimeException("Design review not found"));

        entity.setIsDelete(true);
        entity.setDeleteBy(userId);
        entity.setDeleteDate(Instant.now());
        designReviewRepository.save(entity);
    }

    private PmDesignReviewResponse mapToResponse(PmDesignReview entity) {
        PmDesignReviewResponse dto = new PmDesignReviewResponse();
        dto.setId(entity.getId());
        dto.setReviewCode(entity.getReviewCode());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        if (entity.getProject() != null) {
            dto.setProjectId(entity.getProject().getId());
            dto.setProjectCode(entity.getProject().getProjectCode());
            dto.setProjectName(entity.getProject().getProjectName());
        }
        dto.setReviewableType(entity.getReviewItemType());
        dto.setReviewableId(entity.getReviewItemId());
        dto.setReviewer(entity.getReviewer());
        dto.setAssignedTo(entity.getAssignedTo());
        dto.setSeverity(entity.getSeverity());
        dto.setStatus(entity.getStatus());
        dto.setDueDate(entity.getDueDate());
        dto.setFigmaUrl(entity.getFigmaUrl());
        dto.setEmbedMode(entity.getEmbedMode());
        dto.setIsActive(entity.getIsActive());
        dto.setCreatedDate(entity.getCreatedDate());
        dto.setCreatedBy(entity.getCreatedBy());
        return dto;
    }

    private PmReviewCommentResponse mapCommentToResponse(PmReviewComment comment) {
        PmReviewCommentResponse dto = new PmReviewCommentResponse();
        dto.setId(comment.getId());
        dto.setReviewId(comment.getDesignReview() != null ? comment.getDesignReview().getId() : null);
        dto.setAuthor(comment.getCreatedBy());
        dto.setCommentType(comment.getCommentType());
        dto.setCommentText(comment.getCommentText());
        dto.setSeverity(comment.getSeverity());
        dto.setAssignedTo(comment.getAssignedTo());
        dto.setStatus(comment.getStatus());
        dto.setCreatedAt(comment.getCreatedDate());
        return dto;
    }
}
