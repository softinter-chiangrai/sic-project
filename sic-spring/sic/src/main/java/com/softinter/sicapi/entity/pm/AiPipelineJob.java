package com.softinter.sicapi.entity.pm;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

/** ประวัติงาน AI Full-Project Generator แต่ละครั้ง (บรีฟ, สถานะ, รายละเอียดทีละ step, ผลลัพธ์) */
@Entity
@Table(name = "pm_ai_pipeline_job")
@Data
@EqualsAndHashCode(callSuper = true)
public class AiPipelineJob extends BaseBusinessEntity {

    @Column(name = "created_by_user_id", length = 100)
    private String createdByUserId;

    @Column(name = "project_name")
    private String projectName;

    @Column(name = "prompt", columnDefinition = "TEXT")
    private String prompt;

    @Column(name = "duration_weeks")
    private Integer durationWeeks;

    @Column(name = "ai_model", length = 100)
    private String aiModel;

    /** RUNNING | COMPLETED | COMPLETED_WITH_ERRORS | FAILED */
    @Column(name = "status", length = 30, nullable = false)
    private String status = "RUNNING";

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "project_id")
    private UUID projectId;

    @Column(name = "project_code", length = 50)
    private String projectCode;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "steps", columnDefinition = "JSONB")
    private List<Map<String, Object>> steps;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "counts", columnDefinition = "JSONB")
    private Map<String, Integer> counts;

    @Column(name = "finished", nullable = false)
    private Boolean finished = false;
}
