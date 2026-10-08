package com.softinter.sicapi.dto.response;

import lombok.Data;
import java.time.Instant;
import java.util.UUID;
import java.util.List;

@Data
public class ImpactAnalysisResponse {
    private UUID id;
    private UUID changeRequestId;

    private UUID[] impactedRequirementIds;
    private List<ImpactItem> impactedRequirements;

    private UUID[] impactedSpecIds;
    private List<ImpactItem> impactedSpecs;

    private UUID[] impactedDiagramIds;
    private List<DiagramItem> impactedDiagrams;

    private UUID[] impactedTaskIds;
    private List<ImpactItem> impactedTasks;

    private UUID[] impactedTestCaseIds;
    private List<ImpactItem> impactedTestCases;

    private UUID[] impactedBugIds;
    private List<ImpactItem> impactedBugs;

    // เอกสารส่งมอบ/ดูแลที่ได้รับผลกระทบ หาจากความสัมพันธ์ในตัวเอกสารตอนอ่านผล (ไม่เก็บลง DB)
    private UUID[] impactedManualIds;
    private List<ImpactItem> impactedManuals;

    private UUID[] impactedDeliveryIds;
    private List<ImpactItem> impactedDeliveries;

    private UUID[] impactedInvoiceIds;
    private List<ImpactItem> impactedInvoices;

    private UUID[] impactedMaTicketIds;
    private List<ImpactItem> impactedMaTickets;

    // Upstream Traceability (Project & Customer)
    private UUID[] impactedProjectIds;
    private List<ProjectImpactItem> impactedProjects;

    private UUID[] impactedCustomerIds;
    private List<CustomerImpactItem> impactedCustomers;

    // ฟิลด์ที่ Frontend ใช้แสดงผล (metadata + ประมาณการ)
    private Integer mandayImpact;
    private Integer timelineImpact;
    private String analysisStatus;
    private Instant analyzedAt;
    private String analyzedBy;

    private String dfdImpact;
    private String erImpact;
    private String uiImpact;
    private String apiImpact;
    private String testImpact;
    private String costImpact;
    private String aiRationale;

    @Data
    public static class ImpactItem {
        private UUID id;
        private String code;
        private String name;
    }

    @Data
    public static class ProjectImpactItem {
        private UUID id;
        private String code;
        private String name;
        private String status;
        private UUID customerId;
        private String customerName;
    }

    @Data
    public static class CustomerImpactItem {
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