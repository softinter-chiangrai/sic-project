package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "pm_change_request")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmChangeRequest extends BaseEntity {
    @Column(name = "cr_code", length = 50)
    private String crCode;

    @Column(name = "target_type", nullable = false, length = 50)
    private String targetType; // REQUIREMENT, SPECIFICATION, ER, DFD, TASK

    @Column(name = "target_id", nullable = false)
    private UUID targetId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "change_reason", length = 50)
    private String changeReason; // SCOPE, BUDGET, SCHEDULE, TECHNICAL

    @Column(name = "requester_id", nullable = false, length = 100)
    private String requesterId;

    @Column(name = "project_id")
    private UUID projectId;

    @Column(name = "assignee_id", length = 100)
    private String assigneeId;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "DRAFT"; // DRAFT, SUBMITTED, APPROVED, REJECTED, IMPLEMENTED, CANCELLED

    @Column(name = "target_version", length = 20)
    private String targetVersion;

    @Column(name = "approved_by", length = 100)
    private String approvedBy;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @Column(name = "implemented_at")
    private Instant implementedAt;

    @OneToMany(mappedBy = "changeRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<PmCrAssignee> assignees = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "changeRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<PmChangeImpact> impacts = new java.util.ArrayList<>();
}