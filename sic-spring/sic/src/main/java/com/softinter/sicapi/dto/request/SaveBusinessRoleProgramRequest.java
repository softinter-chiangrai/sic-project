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
    Integer state;
    private Integer rowVersion;
}
