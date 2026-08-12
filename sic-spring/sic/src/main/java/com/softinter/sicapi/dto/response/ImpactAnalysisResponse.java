package com.softinter.sicapi.dto.response;

import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data
public class ImpactAnalysisResponse {
    private UUID id;
    private UUID changeRequestId;

    // 6 ฟิลด์ที่ใช้จริงตามที่คุณบอก
    private UUID[] impactedRequirementIds;
    private UUID[] impactedSpecIds;
    private UUID[] impactedDiagramIds;
    private java.util.List<DiagramItem> impactedDiagrams;
    private UUID[] impactedTaskIds;
    private UUID[] impactedTestCaseIds;
    private UUID[] impactedBugIds;

    // ฟิลด์ที่ Frontend ใช้แสดงผล (metadata + ประมาณการ)
    private Integer mandayImpact;
    private Integer timelineImpact;
    private String analysisStatus;
    private Instant analyzedAt;
    private String analyzedBy;

    @Data
    public static class DiagramItem {
        private UUID id;
        private String name;
        private String diagramType;
    }
}