package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "pm_change_impact_analysis_history")
public class ChangeImpactAnalysisHistory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "change_request_id", nullable = false)
    private PmChangeRequest changeRequest;

    @Column(name = "analysis_id")
    private UUID analysisId;

    @Column(name = "analysis_status", length = 20, nullable = false)
    private String analysisStatus = "MANUAL";

    @Column(name = "version_no", nullable = false)
    private Integer versionNo = 1;

    @Column(name = "manday_impact")
    private Integer mandayImpact;

    @Column(name = "timeline_impact")
    private Integer timelineImpact;

    /** Impact on diagrams of any drawing type (DFD, ER, Flowchart, Sequence, ...). */
    @Column(name = "diagram_impact", columnDefinition = "TEXT")
    private String diagramImpact;

    @Column(name = "ui_impact", columnDefinition = "TEXT")
    private String uiImpact;

    @Column(name = "api_impact", columnDefinition = "TEXT")
    private String apiImpact;

    @Column(name = "test_impact", columnDefinition = "TEXT")
    private String testImpact;

    @Column(name = "cost_impact", columnDefinition = "TEXT")
    private String costImpact;

    @Column(name = "ai_rationale", columnDefinition = "TEXT")
    private String aiRationale;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "impacted_requirement_ids", columnDefinition = "UUID[]")
    private UUID[] impactedRequirementIds;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "impacted_spec_ids", columnDefinition = "UUID[]")
    private UUID[] impactedSpecIds;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "impacted_task_ids", columnDefinition = "UUID[]")
    private UUID[] impactedTaskIds;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "impacted_test_case_ids", columnDefinition = "UUID[]")
    private UUID[] impactedTestCaseIds;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "impacted_bug_ids", columnDefinition = "UUID[]")
    private UUID[] impactedBugIds;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "impacted_diagram_ids", columnDefinition = "UUID[]")
    private UUID[] impactedDiagramIds;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "impacted_table_names", columnDefinition = "TEXT[]")
    private String[] impactedTableNames;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "impacted_project_ids", columnDefinition = "UUID[]")
    private UUID[] impactedProjectIds;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "impacted_customer_ids", columnDefinition = "UUID[]")
    private UUID[] impactedCustomerIds;

    // Derived documents captured at record time (null = recorded before these columns existed)
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "impacted_manual_ids", columnDefinition = "UUID[]")
    private UUID[] impactedManualIds;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "impacted_delivery_ids", columnDefinition = "UUID[]")
    private UUID[] impactedDeliveryIds;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "impacted_invoice_ids", columnDefinition = "UUID[]")
    private UUID[] impactedInvoiceIds;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "impacted_ma_ticket_ids", columnDefinition = "UUID[]")
    private UUID[] impactedMaTicketIds;

    @Column(name = "analyzed_at")
    private Instant analyzedAt;

    @Column(name = "analyzed_by", length = 100)
    private String analyzedBy;
}
