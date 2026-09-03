package com.softinter.sicapi.dto.request;

import com.softinter.sicapi.entity.enums.MaTicketSeverity;
import com.softinter.sicapi.entity.enums.MaTicketStatus;
import com.softinter.sicapi.entity.enums.MaTicketType;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
public class PmMaTicketRequest {
    private UUID id;

    private String ticketNo;

    private UUID customerId;

    private UUID projectId;

    private UUID contractId;

    private MaTicketType ticketType = MaTicketType.BUG_SUPPORT;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private MaTicketSeverity severity = MaTicketSeverity.MEDIUM;
    private MaTicketStatus status = MaTicketStatus.OPEN;

    private List<String> assignedToIds;
    private String reportedBy;
    private Instant reportedDate;
    private Instant targetResponseDate;
    private Instant targetResolveDate;
    private Instant resolvedDate;
    private Instant closedDate;
    private Instant startDate;
    private String startTime;
    private Instant endDate;
    private String endTime;
    private String resolutionSummary;

    private Integer state;
    private Integer rowVersion;
}
