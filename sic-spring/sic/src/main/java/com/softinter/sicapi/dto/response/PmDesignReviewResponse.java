package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
public class PmDesignReviewResponse {
    private UUID id;
    private String reviewCode;
    private String title;
    private String description;
    private UUID projectId;
    private String projectCode;
    private String projectName;
    private String reviewableType;
    private UUID reviewableId;
    private String reviewer;
    private String assignedTo;
    private String severity;
    private String status;
    private LocalDate dueDate;
    private String figmaUrl;
    private String embedMode;
    private Boolean isActive;
    private Instant createdDate;
    private String createdBy;
    private List<PmReviewCommentResponse> comments = new ArrayList<>();
}
