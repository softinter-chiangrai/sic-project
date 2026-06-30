package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.util.UUID;

@Data
public class BusinessRoleProgramResponse {
    private UUID id;
    private UUID businessRoleId;
    private String businessRoleCode;
    private UUID programId;
    private String programCode;
    private String programNameEn;
    private String programNameLocal;
    private String programName;
    private boolean isActive;
    private boolean isAdd;
    private boolean isBack;
    private boolean isPrint;
    private boolean isRemove;
    private boolean isSave;
    private boolean isSearch;
    private Integer rowVersion;
}
