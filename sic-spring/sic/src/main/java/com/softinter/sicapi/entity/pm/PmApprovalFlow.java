package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;
import com.softinter.sicapi.entity.enums.ApprovalMode;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "pm_approval_flow")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmApprovalFlow extends BaseBusinessEntity {

    @Column(name = "flow_code", nullable = false, length = 50, unique = true)
    private String flowCode;

    @Column(name = "flow_name", nullable = false, length = 255)
    private String flowName;

    @Column(name = "document_type", nullable = false, length = 50)
    private String documentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_mode", nullable = false, length = 20)
    private ApprovalMode approvalMode = ApprovalMode.CHAIN;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "flow", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("stepOrder ASC")
    private List<PmApprovalFlowStep> steps = new ArrayList<>();
}
