package com.softinter.sicapi.dto.response;

import lombok.Data;

@Data
public class ApprovalSummaryResponse {
    private long totalPending;
    private long totalApproved;
    private long totalRejected;
    private long totalNeedRevision;
    private long totalExpired;

    // Breakdown by document type
    private long requirementPending;
    private long specificationPending;
    private long deliveryPending;
    private long invoicePending;
    private long changeRequestPending;
}