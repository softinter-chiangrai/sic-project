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
    private String targetType;
    private UUID targetId;
    private String oldValue;
    private String newValue;
    private String ipAddress;
    private String userAgent;
    private String status = "Success";
    private String details;
    private UUID businessId;
}
