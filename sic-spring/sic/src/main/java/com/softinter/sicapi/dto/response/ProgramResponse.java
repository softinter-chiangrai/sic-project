package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.util.UUID;

@Data
public class ProgramResponse {
    private UUID id;
    private UUID parentProgramId;
    private String parentProgramCode;
    private String programCode;
    private String programNameEn;
    private String programNameLocal;
    private String programType;
    private String programPath;
    private String programIcon;
    private Integer sortOrder;
    private boolean isActive;
    private Long rowVersion;
}
