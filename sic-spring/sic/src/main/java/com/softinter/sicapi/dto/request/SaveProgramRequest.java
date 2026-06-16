package com.softinter.sicapi.dto.request;

import com.softinter.sicapi.entity.base.BaseEntity;
import com.softinter.sicapi.entity.enums.EntityState;

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
    private Integer state;
    private Integer rowVersion;
}
