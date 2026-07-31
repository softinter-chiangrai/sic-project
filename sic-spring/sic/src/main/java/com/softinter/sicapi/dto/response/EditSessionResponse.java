package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class EditSessionResponse {
    private UUID id;
    private UUID changeRequestId;
    private String targetType;
    private UUID targetId;
    private String assigneeId;
    private String assigneeName;
    private Instant grantedAt;
    private Instant expiresAt;
    private Boolean isActive;
}