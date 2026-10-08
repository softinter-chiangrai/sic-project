package com.softinter.sicapi.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** สถานะงาน AI Full-Project Generator ที่ทำงานเบื้องหลัง (ใช้ poll แสดงความคืบหน้าทีละขั้น และแสดงในประวัติย้อนหลัง) */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiPipelineJobResponse {
    private UUID jobId;
    /** RUNNING | COMPLETED | COMPLETED_WITH_ERRORS | FAILED */
    private String status;
    private boolean finished;
    private UUID projectId;
    private String projectCode;
    private String projectName;
    private List<Step> steps;
    private Map<String, Integer> createdCounts;
    private String message;
    private String prompt;
    private Integer durationWeeks;
    private String aiModel;
    private Instant createdDate;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Step {
        private String key;
        private String label;
        /** PENDING | RUNNING | DONE | FAILED | SKIPPED */
        private String status;
        private int count;
        private String message;
        /** รายการที่ AI สร้างในขั้นนี้ แต่ละรายการมี code, name, details[{label,value}] (และ script สำหรับ Diagram) */
        private List<Map<String, Object>> items;
    }
}
