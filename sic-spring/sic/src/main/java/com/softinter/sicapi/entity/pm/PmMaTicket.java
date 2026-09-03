package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;
import com.softinter.sicapi.entity.enums.MaTicketSeverity;
import com.softinter.sicapi.entity.enums.MaTicketStatus;
import com.softinter.sicapi.entity.enums.MaTicketType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "pm_ma_ticket")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmMaTicket extends BaseBusinessEntity {

    @Column(name = "ticket_no", nullable = false, length = 50)
    private String ticketNo;

    @Column(name = "customer_id")
    private UUID customerId;

    @Column(name = "project_id")
    private UUID projectId;

    @Column(name = "contract_id")
    private UUID contractId;

    @Enumerated(EnumType.STRING)
    @Column(name = "ticket_type", nullable = false, length = 30)
    private MaTicketType ticketType = MaTicketType.BUG_SUPPORT;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 20)
    private MaTicketSeverity severity = MaTicketSeverity.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private MaTicketStatus status = MaTicketStatus.OPEN;

    @Column(name = "assigned_to", length = 100)
    private String assignedTo;

    @Column(name = "reported_by", nullable = false, length = 100)
    private String reportedBy;

    @Column(name = "reported_date", nullable = false)
    private Instant reportedDate = Instant.now();

    @Column(name = "target_response_date")
    private Instant targetResponseDate;

    @Column(name = "target_resolve_date")
    private Instant targetResolveDate;

    @Column(name = "resolved_date")
    private Instant resolvedDate;

    @Column(name = "closed_date")
    private Instant closedDate;

    @Column(name = "start_date")
    private Instant startDate;

    @Column(name = "start_time", length = 5)
    private String startTime;

    @Column(name = "end_date")
    private Instant endDate;

    @Column(name = "end_time", length = 5)
    private String endTime;

    @Column(name = "resolution_summary", columnDefinition = "TEXT")
    private String resolutionSummary;
}
