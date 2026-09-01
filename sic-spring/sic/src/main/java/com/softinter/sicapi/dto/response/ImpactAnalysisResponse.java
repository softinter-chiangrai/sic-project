package com.softinter.sicapi.dto.response;

import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data
public class ImpactAnalysisResponse {
    private UUID id;
    private UUID changeRequestId;

    private UUID[] impactedRequirementIds;
    private java.util.List<ImpactItem> impactedRequirements;

    private UUID[] impactedSpecIds;
    private java.util.List<ImpactItem> impactedSpecs;

    private UUID[] impactedDiagramIds;
    private java.util.List<DiagramItem> impactedDiagrams;

    private UUID[] impactedTaskIds;
    private java.util.List<ImpactItem> impactedTasks;

    private UUID[] impactedTestCaseIds;
    private java.util.List<ImpactItem> impactedTestCases;

    private UUID[] impactedBugIds;
    private java.util.List<ImpactItem> impactedBugs;

    // ฟิลด์ที่ Frontend ใช้แสดงผล (metadata + ประมาณการ)
    private Integer mandayImpact;
    private Integer timelineImpact;
    private String analysisStatus;
    private Instant analyzedAt;
    private String analyzedBy;

    @Data
    public static class ImpactItem {
        private UUID id;
        private String code;
        private String name;
    }

    @Data
    public static class DiagramItem {
        private UUID id;
        private String name;
        private String diagramType;
    }
}