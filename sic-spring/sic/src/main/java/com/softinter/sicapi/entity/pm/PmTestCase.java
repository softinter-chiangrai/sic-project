// src/main/java/com/softinter/sicapi/entity/pm/PmTestCase.java
package com.softinter.sicapi.entity.pm;

import java.time.Instant;

import com.softinter.sicapi.entity.base.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "pm_test_case")
public class PmTestCase extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private PmTask task;

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

    @Column(name = "related_task", columnDefinition = "TEXT") // เก็บไว้เพื่อแสดงผล แต่ใช้ FK เป็นหลัก
    private String relatedTask;
}