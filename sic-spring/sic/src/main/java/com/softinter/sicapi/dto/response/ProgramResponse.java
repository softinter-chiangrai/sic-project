// src/main/java/com/softinter/sicapi/dto/response/ProgramResponse.java

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
    private String programIcon;
    private String routePath;
    private Integer sortOrder;
    private boolean isActive;
    private Integer rowVersion;
}