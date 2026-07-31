package com.softinter.sicapi.dto.request;

import lombok.Data;
import java.util.UUID;

@Data
public class CrAssigneeRequest {
    private String userId;
    private String targetType;
    private UUID targetId;
}
