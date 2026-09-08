package com.softinter.sicapi.dto.response;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class DashboardSummaryResponse {
    private long totalProjects;
    private long activeProjects;
    private long delayedProjects;
    private long completedProjects;

    private long openBugs;
    private long criticalOpenBugs;

    private long pendingInvoiceCount;
    private BigDecimal pendingInvoiceAmount = BigDecimal.ZERO;

    private long openMaTickets;

    private long contractsNearExpiry;

    // ===== SDLC Metric Additions =====
    // 1. SDLC Funnel Stages Counts
    private long stageRequirementsCount;
    private long stageDesignReviewsCount;
    private long stageDevTasksCount;
    private long stageTestCasesCount;
    private long stageDeliveriesCount;

    // 2. Bug Quality & Severity Breakdown
    private long totalBugs;
    private long closedBugs;
    private long highBugs;
    private long mediumBugs;
    private long lowBugs;

    // 3. Test Management Metrics
    private long totalTestCases;
    private long passedTestCases;
    private long failedTestCases;
    private long pendingTestCases;

    // 4. Manday Burn Rate
    private long totalBudgetManday;
    private long totalUsedManday;
}

