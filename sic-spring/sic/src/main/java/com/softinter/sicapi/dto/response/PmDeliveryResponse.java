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
    private LocalDate deliveryDate;
    private String deliveryVersion;
    private String releaseNote;
    private String deliverySummary;
    private String status;
    private String pmApprovedBy;
    private Instant pmApprovedDate;
    private String customerSignedBy;
    private Instant customerSignedDate;
    private UUID attachmentGroupId;
    private List<PmDeliveryChecklistResponse> checklists;
    private String createdBy;
    private Instant createdDate;
    private String updatedBy;
    private Instant updatedDate;
    private Integer rowVersion;
}
