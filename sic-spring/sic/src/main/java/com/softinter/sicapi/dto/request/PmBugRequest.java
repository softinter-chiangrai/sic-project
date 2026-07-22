package com.softinter.sicapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class PmBugRequest {

    private UUID id;

    @NotBlank(message = "Bug code is required")
    private String bugCode;

    @NotBlank(message = "Title is required")
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

    // ===== Traceability =====
    private UUID taskId;        // เชื่อมกับ Task
    private UUID testCaseId;    // เชื่อมกับ Test Case

    private Integer state;
    private Integer rowVersion;
}