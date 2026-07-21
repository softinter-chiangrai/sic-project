// src/main/java/com/softinter/sicapi/dto/request/ChangeRequestRequest.java
package com.softinter.sicapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ChangeRequestRequest {
    private UUID id;

    @NotNull(message = "Requirement ID is required")
    private UUID requirementId;

    @NotBlank(message = "Change description is required")
    private String changeDescription;

    private String impactSummary;
    private Integer estimatedManday;

    private String status; // Draft, Submitted, Approved, Rejected, Implemented

    private Integer rowVersion;
    private Integer state;
}