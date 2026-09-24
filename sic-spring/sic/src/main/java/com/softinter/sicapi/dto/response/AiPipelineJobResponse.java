package com.softinter.sicapi.dto.response;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** สถานะงาน AI Full-Project Generator ที่ทำงานเบื้องหลัง (ใช้ poll แสดงความคืบหน้าทีละขั้น) */
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
    }
}
