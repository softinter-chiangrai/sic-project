package com.softinter.sicapi.dto.request;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ApprovalSearchRequest extends PageableRequest {
    private String documentType;
    private String status;
    private String requestedBy;
    private String approver;
    private String keyword;
}