package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class PmBugResponse {
    private UUID id;
    private String bugCode;
    private String title;
    private String description;
    private String severity;
    private String priority;
    private String foundBy;
    private String assignedTo;
    private Instant foundDate;
    private Instant fixDueDate;
    private Instant fixedDate;
    private String status;
    private String relatedSpec;
    private Instant createdDate;
    private Instant updatedDate;
    private Integer rowVersion;
}