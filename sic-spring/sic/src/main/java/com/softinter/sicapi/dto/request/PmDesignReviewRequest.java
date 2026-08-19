package com.softinter.sicapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class PmDesignReviewRequest {
    private UUID id;

    @NotBlank(message = "Review code is required")
    private String reviewCode;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Project ID is required")
    private UUID projectId;

    @NotBlank(message = "Review item type is required")
    private String reviewableType;

    private UUID reviewableId;

    private String reviewer;
    private String assignedTo;
    private String severity = "Medium";
    private String status = "Open";
    private LocalDate dueDate;
    private String figmaUrl;
    private String embedMode = "prototype";
    private Boolean isActive = true;
}
