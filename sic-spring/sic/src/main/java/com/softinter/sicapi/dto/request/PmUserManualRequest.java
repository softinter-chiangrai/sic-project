package com.softinter.sicapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class PmUserManualRequest {
    private UUID id;

    @NotNull(message = "Project ID is required")
    private UUID projectId;

    @NotBlank(message = "Manual code is required")
    private String manualCode;

    @NotBlank(message = "Manual title is required")
    private String manualTitle;

    private String manualType = "USER";
    private String version = "1.0";
    private UUID relatedSpecId;
    private UUID deliveryId;
    private String status = "DRAFT";
    private UUID attachmentGroupId;
    private List<PmUserManualSectionRequest> sections;
    private Integer state;
    private Integer rowVersion;
}
