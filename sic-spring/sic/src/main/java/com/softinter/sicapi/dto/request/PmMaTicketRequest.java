package com.softinter.sicapi.dto.request;

import com.softinter.sicapi.entity.enums.MaTicketSeverity;
import com.softinter.sicapi.entity.enums.MaTicketStatus;
import com.softinter.sicapi.entity.enums.MaTicketType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class PmMaTicketRequest {
    private UUID id;

    private String ticketNo;

    @NotNull(message = "Customer ID is required")
    private UUID customerId;

    @NotNull(message = "Project ID is required")
    private UUID projectId;

    private UUID contractId;

    private MaTicketType ticketType = MaTicketType.BUG_SUPPORT;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private MaTicketSeverity severity = MaTicketSeverity.MEDIUM;
    private MaTicketStatus status = MaTicketStatus.OPEN;

    private String assignedTo;
    private String reportedBy;
    private Instant reportedDate;
    private Instant targetResponseDate;
    private Instant targetResolveDate;
    private Instant resolvedDate;
    private Instant closedDate;
    private String resolutionSummary;

    private Integer state;
    private Integer rowVersion;
}
