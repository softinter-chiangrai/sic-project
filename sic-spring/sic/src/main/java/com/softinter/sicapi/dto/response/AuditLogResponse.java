package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class AuditLogResponse {
    private UUID id;
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
    private String status;
    private String details;
    private UUID businessId;
    private Instant createdDate;
    private String createdBy;
}
