package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;
import com.softinter.sicapi.entity.enums.ApprovalStatus;
import com.softinter.sicapi.entity.su.SuUpload;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "pm_approval")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmApproval extends BaseBusinessEntity {

    // ===== Polymorphic Document Reference =====
    @Column(name = "document_type", nullable = false, length = 50)
    private String documentType;

    @Column(name = "document_id", nullable = false)
    private UUID documentId;

    @Column(name = "document_code", length = 50)
    private String documentCode;

    @Column(name = "document_title", length = 500)
    private String documentTitle;

    // ===== Document Version =====
    @Column(name = "version", length = 20)
    private String version;

    // ===== Request Info =====
    @Column(name = "requested_by", nullable = false, length = 100)
    private String requestedBy;

    @Column(name = "requested_by_name", length = 255)
    private String requestedByName;

    @Column(name = "requested_date")
    private Instant requestedDate = Instant.now();

    // ===== Flow =====
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flow_id", nullable = false)
    private PmApprovalFlow flow;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_step_id")
    private PmApprovalFlowStep currentStep;

    // ===== Status =====
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ApprovalStatus status = ApprovalStatus.PENDING;

    // ===== Final Approval =====
    @Column(name = "final_approver", length = 100)
    private String finalApprover;

    @Column(name = "final_approval_date")
    private Instant finalApprovalDate;

    // ===== Extra =====
    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attachment_id")
    private SuUpload attachment;

    @Column(name = "reference_id")
    private UUID referenceId;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "extra_data", columnDefinition = "JSONB")
    private Map<String, Object> extraData;

    // ===== Relationships =====
    @OneToMany(mappedBy = "approval", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PmApprovalStepStatus> stepStatuses = new ArrayList<>();

    @OneToMany(mappedBy = "approval", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdDate ASC")
    private List<PmApprovalLog> logs = new ArrayList<>();
}
