package com.softinter.sicapi.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class AuditLogRequest {
    private String userId;
    private String username;
    private String userFullname;
    private String action;
    private String module;
    private String description;
    private String ipAddress;
    private String status = "Success";
    private String details;
    private UUID businessId;
}
