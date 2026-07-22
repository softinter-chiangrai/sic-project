package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "pm_test_case")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmTestCase extends BaseBusinessEntity {

    @Column(name = "scenario_id")
    private UUID scenarioId;

    @Column(name = "task_id")
    private UUID taskId;

    @Column(name = "test_case_code", nullable = false, length = 30)
    private String testCaseCode;

    @Column(name = "test_step", nullable = false, columnDefinition = "TEXT")
    private String testStep;

    @Column(name = "expected_result", nullable = false, columnDefinition = "TEXT")
    private String expectedResult;

    @Column(name = "actual_result", columnDefinition = "TEXT")
    private String actualResult;

    @Column(name = "test_status", length = 20)
    private String testStatus = "Pending";

    @Column(name = "tester", length = 100)
    private String tester;

    @Column(name = "test_date")
    private Instant testDate;

    @Column(name = "related_requirement", columnDefinition = "TEXT")
    private String relatedRequirement;

    @Column(name = "related_spec", columnDefinition = "TEXT")
    private String relatedSpec;

    @Column(name = "related_task", columnDefinition = "TEXT")
    private String relatedTask;

    // ===== Relationships =====
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", insertable = false, updatable = false)
    private PmTask task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scenario_id", insertable = false, updatable = false)
    private PmTestScenario scenario;
}