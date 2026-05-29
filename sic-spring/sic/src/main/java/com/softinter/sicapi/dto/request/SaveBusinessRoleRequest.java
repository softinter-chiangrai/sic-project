package com.softinter.sicapi.dto.request;

import com.softinter.sicapi.entity.base.BaseEntity;
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
    private BaseEntity.EntityState state = BaseEntity.EntityState.DETACHED;
    private Long rowVersion;
}
