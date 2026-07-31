package com.softinter.sicapi.dto.response;

import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data
public class CrAssigneeResponse {
    private UUID id;
    private String userId;
    private String userName;
    private String targetType;
    private UUID targetId;
    private String status;
    private Instant completedAt;
}
