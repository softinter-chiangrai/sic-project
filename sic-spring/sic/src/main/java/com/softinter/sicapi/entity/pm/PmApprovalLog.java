package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseEntity;
import com.softinter.sicapi.entity.enums.ApprovalStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "pm_approval_log")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmApprovalLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approval_id", nullable = false)
    private PmApproval approval;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "step_status_id")
    private PmApprovalStepStatus stepStatus;

    @Column(name = "action", nullable = false, length = 30)
    private String action;

    @Column(name = "actor", nullable = false, length = 100)
    private String actor;

    @Column(name = "actor_name", length = 255)
    private String actorName;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @Enumerated(EnumType.STRING)
    @Column(name = "old_status", length = 20)
    private ApprovalStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", length = 20)
    private ApprovalStatus newStatus;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "extra_data", columnDefinition = "JSONB")
    private Map<String, Object> extraData;
}