package com.softinter.sicapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class PmDeliveryRequest {
    private UUID id;

    @NotNull(message = "Project ID is required")
    private UUID projectId;

    @NotBlank(message = "Delivery code is required")
    private String deliveryCode;

    @NotBlank(message = "Delivery title is required")
    private String deliveryTitle;

    private String deliveryType = "FINAL";
    private UUID contractId;
    private UUID milestoneId;
    private LocalDate deliveryDate;
    private String deliveryVersion = "1.0";
    private String releaseNote;
    private String deliverySummary;
    private String status = "DRAFT";
    private String pmApprovedBy;
    private Instant pmApprovedDate;
    private String customerSignedBy;
    private Instant customerSignedDate;
    private UUID attachmentGroupId;
    private List<PmDeliveryChecklistRequest> checklists;
    private Integer state;
    private Integer rowVersion;
}
