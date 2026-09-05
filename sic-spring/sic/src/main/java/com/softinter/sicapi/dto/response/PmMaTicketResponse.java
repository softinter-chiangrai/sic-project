package com.softinter.sicapi.dto.response;

import com.softinter.sicapi.entity.enums.MaTicketSeverity;
import com.softinter.sicapi.entity.enums.MaTicketStatus;
import com.softinter.sicapi.entity.enums.MaTicketType;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
public class PmMaTicketResponse {
    private UUID id;
    private UUID businessId;
    private String ticketNo;
    private UUID customerId;
    private String customerName;
    private UUID projectId;
    private String projectName;
    private UUID contractId;
    private String contractNo;
    private MaTicketType ticketType;
    private String title;
    private String description;
    private MaTicketSeverity severity;
    private MaTicketStatus status;
    private Boolean isLocked;
    private String assignedTo;
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

    private String createdBy;
    private Instant createdDate;
    private String updatedBy;
    private Instant updatedDate;
    private Integer rowVersion;
}
