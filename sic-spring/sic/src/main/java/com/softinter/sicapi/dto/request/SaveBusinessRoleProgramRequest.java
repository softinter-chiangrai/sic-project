package com.softinter.sicapi.dto.request;

import com.softinter.sicapi.entity.base.BaseEntity;
import lombok.Data;

import java.util.UUID;

@Data
public class SaveBusinessRoleProgramRequest {
    private UUID id;
    private UUID businessRoleId;
    private UUID programId;
    private boolean isActive = true;
    private BaseEntity.EntityState state = BaseEntity.EntityState.DETACHED;
    private Long rowVersion;
}
