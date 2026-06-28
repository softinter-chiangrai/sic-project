package com.softinter.sicapi.dto.request;

import com.softinter.sicapi.entity.base.BaseEntity;
import com.softinter.sicapi.entity.enums.EntityState;

import lombok.Data;

import java.util.UUID;

@Data
public class SaveBusinessRoleRequest {
    private UUID id;
    private UUID businessId;
    private UUID parentRoleId;
    private String roleCode;
    private String roleNameEn;
    private String roleNameLocal;
    private String roleLevel;
    private Integer sortOrder;
    private boolean isActive = true;
    private Integer state;
    private Integer rowVersion;
    private String color;
}
