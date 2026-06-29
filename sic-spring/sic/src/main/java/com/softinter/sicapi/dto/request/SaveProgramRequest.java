// src/main/java/com/softinter/sicapi/dto/request/SaveProgramRequest.java

package com.softinter.sicapi.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.UUID;

@Data
public class SaveProgramRequest {
    private UUID id;
    private UUID parentProgramId;
    private String programCode;
    private String programNameEn;
    private String programNameLocal;
    private String programIcon;
    private String routePath;
    private Integer sortOrder;

    @JsonProperty("isActive")
    private boolean isActive;

    private Integer state;
    private Integer rowVersion;
}