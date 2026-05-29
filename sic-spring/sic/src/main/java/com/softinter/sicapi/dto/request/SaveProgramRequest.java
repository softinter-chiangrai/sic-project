package com.softinter.sicapi.dto.request;

import com.softinter.sicapi.entity.base.BaseEntity;
import lombok.Data;

import java.util.UUID;

@Data
public class SaveProgramRequest {
    private UUID id;
    private UUID parentProgramId;
    private String programCode;
    private String programNameEn;
    private String programNameLocal;
    private String programType;
    private String programPath;
    private String programIcon;
    private Integer sortOrder;
    private boolean isActive = true;
    private BaseEntity.EntityState state = BaseEntity.EntityState.DETACHED;
    private Long rowVersion;
}
