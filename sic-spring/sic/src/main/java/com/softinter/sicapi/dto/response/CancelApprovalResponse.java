// ============================================================
// 5. dto/response/CancelApprovalResponse.java
// ============================================================
package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class CancelApprovalResponse {
    private int cancelledCount;
    private List<ApprovalResponse> cancelledApprovals;
    private String message;
}