package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class PmReviewCommentResponse {
    private UUID id;
    private UUID reviewId;
    private String author;
    private String commentType;
    private String commentText;
    private String severity;
    private String assignedTo;
    private String status;
    private Instant createdAt;
}
