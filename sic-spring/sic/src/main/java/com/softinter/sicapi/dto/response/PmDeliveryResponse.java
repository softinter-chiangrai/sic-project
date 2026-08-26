package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class PmDeliveryResponse {
    private UUID id;
    private UUID businessId;
    private UUID projectId;
    private String deliveryCode;
    private String deliveryTitle;
    private String deliveryType;
    private UUID contractId;
    private UUID milestoneId;
    private Instant deliveryDate;
    private String deliveryVersion;
    private String releaseNote;
    private String deliverySummary;
    private String status;
    private String pmApprovedBy;
    private Instant pmApprovedDate;
    private String customerSignedBy;
    private Instant customerSignedDate;
    private UUID attachmentGroupId;
    private Boolean isLocked;
    private Boolean isGatePassed;
    private Integer passedGateChecks;
    private Integer totalGateChecks;
    private Boolean isChecklistPassed;
    private Integer checkedChecklistCount;
    private Integer totalChecklistCount;
    private List<PmDeliveryChecklistResponse> checklists;
    private List<PmDeliveryItemResponse> items;
    private String createdBy;
    private Instant createdDate;
    private String updatedBy;
    private Instant updatedDate;
    private Integer rowVersion;
}
