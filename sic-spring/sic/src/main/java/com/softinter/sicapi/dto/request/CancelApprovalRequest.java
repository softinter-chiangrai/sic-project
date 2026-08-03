// ============================================================
// 4. dto/request/CancelApprovalRequest.java
// ============================================================
package com.softinter.sicapi.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class CancelApprovalRequest {
    private String reason;
}