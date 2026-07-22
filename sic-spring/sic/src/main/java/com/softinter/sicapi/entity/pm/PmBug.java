package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "pm_bug")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmBug extends BaseBusinessEntity {

    @Column(name = "task_id")
    private UUID taskId;

    @Column(name = "test_case_id")
    private UUID testCaseId;

    @Column(name = "bug_code", nullable = false, length = 30)
    private String bugCode;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "severity", nullable = false, length = 20)
    private String severity;

    @Column(name = "priority", nullable = false, length = 20)
    private String priority;

    @Column(name = "found_by", length = 100)
    private String foundBy;

    @Column(name = "assigned_to", length = 100)
    private String assignedTo;

    @Column(name = "found_date")
    private Instant foundDate;

    @Column(name = "fix_due_date")
    private Instant fixDueDate;

    @Column(name = "fixed_date")
    private Instant fixedDate;

    @Column(name = "status", length = 20)
    private String status = "Open";

    @Column(name = "related_spec", length = 255)
    private String relatedSpec;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", insertable = false, updatable = false)
    private PmTask task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_case_id", insertable = false, updatable = false)
    private PmTestCase testCase;
}