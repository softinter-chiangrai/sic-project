package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
public class PmUserManualResponse {
    private UUID id;
    private UUID businessId;
    private UUID projectId;
    private String manualCode;
    private String manualTitle;
    private String manualType;
    private String version;
    private UUID relatedSpecId;
    private UUID deliveryId;
    private String status;
    private Boolean isLocked;
    private UUID attachmentGroupId;
    private List<PmUserManualSectionResponse> sections;
    private String createdBy;
    private Instant createdDate;
    private String updatedBy;
    private Instant updatedDate;
    private Integer rowVersion;
}
