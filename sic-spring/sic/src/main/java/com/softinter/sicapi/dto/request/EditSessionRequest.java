package com.softinter.sicapi.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class EditSessionRequest {
    private UUID changeRequestId;
    private String targetType;
    private UUID targetId;
    private String assigneeId;
    private Integer expiresInHours;
}