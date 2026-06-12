package com.softinter.sicapi.dto.request;

import com.softinter.sicapi.entity.base.BaseEntity;
import com.softinter.sicapi.entity.enums.EntityState;

import lombok.Data;

import java.util.UUID;

@Data
public class SaveBusinessRoleProgramRequest {
    private UUID id;
    private UUID businessRoleId;
    private UUID programId;
    private boolean isActive = true;
    private EntityState state = EntityState.DETACHED;
    private Integer rowVersion;
}
