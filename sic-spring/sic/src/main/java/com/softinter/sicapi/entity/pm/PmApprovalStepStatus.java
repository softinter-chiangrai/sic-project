package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseEntity;
import com.softinter.sicapi.entity.enums.ApprovalStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "pm_approval_step_status")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmApprovalStepStatus extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approval_id", nullable = false)
    private PmApproval approval;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "step_id", nullable = false)
    private PmApprovalFlowStep step;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ApprovalStatus status = ApprovalStatus.PENDING;

    @Column(name = "approver", length = 100)
    private String approver;

    @Column(name = "approver_name", length = 255)
    private String approverName;

    @Column(name = "approval_date")
    private Instant approvalDate;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @Column(name = "signature_url", length = 500)
    private String signatureUrl;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "is_completed")
    private Boolean isCompleted = false;
}