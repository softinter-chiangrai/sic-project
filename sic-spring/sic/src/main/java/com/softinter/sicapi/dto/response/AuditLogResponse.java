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
    private String ipAddress;
    private String status;
    private String details;
    private UUID businessId;
    private Instant createdDate;
    private String createdBy;
}
