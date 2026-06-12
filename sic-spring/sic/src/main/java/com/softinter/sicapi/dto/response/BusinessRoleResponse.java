package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.util.UUID;

@Data
public class BusinessRoleResponse {
    private UUID id;
    private UUID businessId;
    private String businessName;
    private UUID parentRoleId;
    private String parentRoleCode;
    private String roleCode;
    private String roleNameEn;
    private String roleNameLocal;
    private String roleLevel;
    private Integer sortOrder;
    private boolean isActive;
    private Integer rowVersion;
}
