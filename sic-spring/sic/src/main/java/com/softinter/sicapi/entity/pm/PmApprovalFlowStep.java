package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

@Entity
@Table(name = "pm_approval_flow_step")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmApprovalFlowStep extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flow_id", nullable = false)
    private PmApprovalFlow flow;

    @Column(name = "step_order", nullable = false)
    private Integer stepOrder;

    @Column(name = "step_name", nullable = false, length = 255)
    private String stepName;

    @Column(name = "approver_role", length = 50)
    private String approverRole;

    @Column(name = "approver_user_id", length = 100)
    private String approverUserId;

    @Column(name = "is_required")
    private Boolean isRequired = true;

    @Column(name = "timeout_days")
    private Integer timeoutDays;

    @Column(name = "can_skip")
    private Boolean canSkip = false;

    @Column(name = "condition_expression", length = 500)
    private String conditionExpression;
}
