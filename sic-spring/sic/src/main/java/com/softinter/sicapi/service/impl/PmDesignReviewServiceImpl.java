package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.PmDesignReviewRequest;
import com.softinter.sicapi.dto.response.PmDesignReviewResponse;
import com.softinter.sicapi.dto.response.PmReviewCommentResponse;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.entity.pm.PmDesignReview;
import com.softinter.sicapi.entity.pm.PmReviewComment;

import com.softinter.sicapi.dto.response.ComboboxResponse;
import com.softinter.sicapi.repository.pm.PmSpecificationRepository;
import com.softinter.sicapi.repository.pm.PmRequirementRepository;
import com.softinter.sicapi.service.TaskService;
import com.softinter.sicapi.service.SuUserBusinessService;

import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmDesignReviewRepository;
import com.softinter.sicapi.repository.pm.PmReviewCommentRepository;
import com.softinter.sicapi.service.PmDesignReviewService;
import com.softinter.sicapi.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.entity.su.SuProfile;
import com.softinter.sicapi.repository.su.SuProfileRepository;
import com.softinter.sicapi.util.LocalizationHelper;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PmDesignReviewServiceImpl implements PmDesignReviewService {

    private final PmDesignReviewRepository designReviewRepository;
    private final PmReviewCommentRepository reviewCommentRepository;
    private final PmCustomerProjectRepository projectRepository;
    private final SuProfileRepository profileRepository;
    private final PmSpecificationRepository specificationRepository;
    private final PmRequirementRepository requirementRepository;
    private final TaskService taskService;
    private final SuUserBusinessService userBusinessService;
    private final AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public Page<PmDesignReviewResponse> findAll(UUID businessId, UUID projectId, String status, String keyword, Pageable pageable) {
        Specification<PmDesignReview> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("businessId"), businessId));
            predicates.add(cb.equal(root.get("isDelete"), false));

            if (projectId != null) {
                predicates.add(cb.equal(root.get("project").get("id"), projectId));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.toLowerCase().trim() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("reviewCode")), pattern),
                        cb.like(cb.lower(root.get("reviewer")), pattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<PmDesignReview> page = designReviewRepository.findAll(spec, pageable);
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
        boolean isNew = (request.getId() == null);
        String oldStatus = null;

        if (!isNew) {
            entity = designReviewRepository.findByIdAndBusinessId(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("Design review not found"));
            oldStatus = entity.getStatus();
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
        entity.setReviewItemType(request.getReviewableType() != null && !request.getReviewableType().isBlank() ? request.getReviewableType() : "Specification");
        entity.setReviewItemId(request.getReviewableId());
        entity.setReviewer(request.getReviewer());
        entity.setAssignedTo(request.getAssignedTo());
        entity.setSeverity(request.getSeverity());
        entity.setStatus(request.getStatus());
        entity.setDueDate(request.getDueDate());
        entity.setFigmaUrl(request.getFigmaUrl());
        entity.setEmbedMode(request.getEmbedMode());
        entity.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        // แก้ไขเอกสารที่เคยอนุมัติแล้ว ต้องเปลี่ยนสถานะกลับเป็น "Changed" และขออนุมัติใหม่
        if ("Resolved".equalsIgnoreCase(oldStatus)) {
            entity.setStatus("Changed");
        }

        PmDesignReview saved = designReviewRepository.save(entity);

        try {
            String action = isNew ? "CREATE_DESIGN_REVIEW" : "UPDATE_DESIGN_REVIEW";
            auditLogService.log(action, "Design Review Management",
                    (isNew ? "สร้าง Design Review: " : "แก้ไข Design Review: ") + saved.getTitle() + " (" + saved.getReviewCode() + ")",
                    "DESIGN_REVIEW", saved.getId(), null, null, "Success", null);
        } catch (Exception e) {
            log.error("ผิดพลาด audit log design review: {}", e.getMessage(), e);
        }

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

        try {
            auditLogService.log("DELETE_DESIGN_REVIEW", "Design Review Management",
                    "ลบ Design Review: " + entity.getTitle() + " (" + entity.getReviewCode() + ")",
                    "DESIGN_REVIEW", entity.getId(), null, null, "Success", null);
        } catch (Exception e) {
            log.error("ผิดพลาด audit log DELETE_DESIGN_REVIEW: {}", e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public PmReviewCommentResponse addComment(UUID reviewId, com.softinter.sicapi.dto.request.PmReviewCommentRequest request, UUID businessId, String userId) {
        PmDesignReview review = designReviewRepository.findByIdAndBusinessId(reviewId, businessId)
                .orElseThrow(() -> new RuntimeException("Design review not found"));

        PmReviewComment comment = new PmReviewComment();
        comment.setBusinessId(businessId);
        comment.setDesignReview(review);
        comment.setCommentText(request.getCommentText());
        comment.setCommentType(request.getCommentType() != null ? request.getCommentType() : "Suggestion");
        comment.setSeverity(request.getSeverity());
        comment.setAssignedTo(request.getAssignedTo());
        comment.setStatus("Open");
        comment.setCreatedBy(userId);
        comment.setCreatedDate(Instant.now());
        comment.setUpdatedBy(userId);
        comment.setUpdatedDate(Instant.now());
        comment.setIsDelete(false);

        PmReviewComment saved = reviewCommentRepository.save(comment);
        return mapCommentToResponse(saved);
    }

    private String resolveDisplayName(String userId) {
        if (userId == null || userId.isBlank()) return "Unknown";
        try {
            SuProfile profile = profileRepository.findByUserId(userId).orElse(null);
            if (profile != null) {
                String fullName = LocalizationHelper.getFullName(profile);
                if (fullName != null && !fullName.isBlank()) {
                    return fullName;
                }
            }
        } catch (Exception ignored) {
        }
        return userId;
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
        dto.setCreatedBy(resolveDisplayName(entity.getCreatedBy()));

        if (entity.getId() != null) {
            List<PmReviewComment> comments = reviewCommentRepository.findByReviewId(entity.getId());
            dto.setComments(comments.stream().map(this::mapCommentToResponse).collect(Collectors.toList()));
        }

        return dto;
    }

    private PmReviewCommentResponse mapCommentToResponse(PmReviewComment comment) {
        PmReviewCommentResponse dto = new PmReviewCommentResponse();
        dto.setId(comment.getId());
        dto.setReviewId(comment.getDesignReview() != null ? comment.getDesignReview().getId() : null);
        dto.setAuthor(resolveDisplayName(comment.getCreatedBy()));
        dto.setCommentType(comment.getCommentType());
        dto.setCommentText(comment.getCommentText());
        dto.setSeverity(comment.getSeverity());
        dto.setAssignedTo(comment.getAssignedTo());
        dto.setStatus(comment.getStatus());
        dto.setCreatedAt(comment.getCreatedDate());
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComboboxResponse> getComboboxSpecifications(UUID businessId, UUID projectId, String type, String value) {
        if ("Requirement".equalsIgnoreCase(type)) {
            if (value != null && !value.isBlank()) {
                try {
                    UUID reqId = UUID.fromString(value);
                    return requirementRepository.findByIdAndBusinessId(reqId, businessId)
                            .map(r -> List.of(new ComboboxResponse(r.getId().toString(), (r.getRequirementCode() != null ? r.getRequirementCode() + " - " : "") + r.getTitle())))
                            .orElse(List.of());
                } catch (IllegalArgumentException e) {
                    return List.of();
                }
            }
            List<com.softinter.sicapi.entity.pm.PmRequirement> list = projectId != null
                    ? requirementRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(businessId, projectId)
                    : requirementRepository.findByBusinessIdAndIsDeleteFalse(businessId);
            return list.stream()
                    .map(r -> new ComboboxResponse(r.getId().toString(), (r.getRequirementCode() != null ? r.getRequirementCode() + " - " : "") + r.getTitle()))
                    .collect(Collectors.toList());
        }

        // Default or Specification
        if (value != null && !value.isBlank()) {
            try {
                UUID specId = UUID.fromString(value);
                return specificationRepository.findByIdAndBusinessIdAndIsDeleteFalse(specId, businessId)
                        .map(s -> List.of(new ComboboxResponse(s.getId().toString(), (s.getSpecificationCode() != null ? s.getSpecificationCode() + " - " : "") + s.getTitle())))
                        .orElse(List.of());
            } catch (IllegalArgumentException e) {
                return List.of();
            }
        }
        List<com.softinter.sicapi.entity.pm.PmSpecification> specs = projectId != null
                ? specificationRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(businessId, projectId)
                : specificationRepository.findByBusinessIdAndIsDeleteFalse(businessId);
        return specs.stream()
                .map(s -> new ComboboxResponse(s.getId().toString(), (s.getSpecificationCode() != null ? s.getSpecificationCode() + " - " : "") + s.getTitle()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComboboxResponse> getComboboxProjects(UUID businessId) {
        return projectRepository.findByBusinessIdAndIsDeleteFalse(businessId).stream()
                .map(p -> new ComboboxResponse(p.getId().toString(), p.getProjectName()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComboboxResponse> getComboboxRequirements(UUID businessId, UUID projectId) {
        List<com.softinter.sicapi.entity.pm.PmRequirement> list = projectId != null
                ? requirementRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(businessId, projectId)
                : requirementRepository.findByBusinessIdAndIsDeleteFalse(businessId);
        return list.stream()
                .map(r -> new ComboboxResponse(r.getId().toString(), (r.getRequirementCode() != null ? r.getRequirementCode() + " - " : "") + r.getTitle()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComboboxResponse> getComboboxTasks(UUID businessId, UUID projectId) {
        if (projectId == null) {
            return List.of();
        }
        return taskService.getAllTasksByProjectId(projectId).stream()
                .map(t -> new ComboboxResponse(t.getId().toString(), t.getTaskCode() + " - " + t.getTaskName()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComboboxResponse> getComboboxUsers(UUID businessId) {
        return userBusinessService.getAvailableUsers().stream()
                .map(u -> new ComboboxResponse(u.getName(), u.getName()))
                .collect(Collectors.toList());
    }
}


