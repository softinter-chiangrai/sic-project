// src/main/java/com/softinter/sicapi/entity/pm/ChangeImpactAnalysis.java
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
@Table(name = "pm_change_impact_analysis")
public class ChangeImpactAnalysis extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "change_request_id", nullable = false)
    private PmRequirementChangeRequest changeRequest;

    @Column(name = "dfd_impact", columnDefinition = "TEXT")
    private String dfdImpact;

    @Column(name = "er_impact", columnDefinition = "TEXT")
    private String erImpact;

    @Column(name = "ui_impact", columnDefinition = "TEXT")
    private String uiImpact;

    @Column(name = "api_impact", columnDefinition = "TEXT")
    private String apiImpact;

    @Column(name = "test_impact", columnDefinition = "TEXT")
    private String testImpact;

    @Column(name = "manday_impact")
    private Integer mandayImpact;

    @Column(name = "timeline_impact")
    private Integer timelineImpact;

    @Column(name = "cost_impact", columnDefinition = "TEXT")
    private String costImpact;

    // ---- Array fields สำหรับ Auto-Detect 100% ----
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
    @Column(name = "impacted_table_names", columnDefinition = "TEXT[]")
    private String[] impactedTableNames;

    @Column(name = "analysis_status", length = 20)
    private String analysisStatus = "MANUAL";

    @Column(name = "analyzed_at")
    private Instant analyzedAt;

    @Column(name = "analyzed_by", length = 100)
    private String analyzedBy;
}