package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.util.UUID;

@Data
public class UserBusinessRoleResponse {
    private UUID id;
    private UUID userBusinessId;
    private String userId;
    private UUID businessId;
    private UUID businessRoleId;
    private String businessRoleCode;
    private String businessRoleName;
    private boolean isActive;
    private Integer rowVersion;
}
