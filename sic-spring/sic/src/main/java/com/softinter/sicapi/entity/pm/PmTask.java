package com.softinter.sicapi.entity.pm;

import java.time.Instant;

import com.softinter.sicapi.entity.base.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "pm_task")
@Getter @Setter
public class PmTask extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_package_id")
    private PmWorkPackage workPackage;

    @Column(name = "task_code", nullable = false, length = 30)
    private String taskCode;

    @Column(name = "task_name", nullable = false, length = 255)
    private String taskName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "assigned_to", length = 100)
    private String assignedTo;

    @Column(name = "start_date")
    private Instant startDate;

    @Column(name = "end_date")
    private Instant endDate;

    @Column(name = "actual_start")
    private Instant actualStart;

    @Column(name = "actual_end")
    private Instant actualEnd;

    @Column(name = "estimate_manday")
    private Integer estimateManday;

    @Column(name = "actual_manday")
    private Integer actualManday;

    @Column(length = 20)
    private String status;

    @Column(length = 20)
    private String priority;
}
