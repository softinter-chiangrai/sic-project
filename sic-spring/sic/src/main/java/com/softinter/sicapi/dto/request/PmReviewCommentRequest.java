package com.softinter.sicapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PmReviewCommentRequest {
    @NotBlank(message = "Comment text is required")
    private String commentText;

    private String commentType = "Suggestion";

    private String severity;

    private String assignedTo;
}
