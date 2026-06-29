package com.softinter.sicapi.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.UUID;

@Data
public class SaveBusinessRoleProgramRequest {
    private UUID id;
    private UUID businessRoleId;
    private UUID programId;

    @JsonProperty("isActive")
    private boolean active = true;

    @JsonProperty("isAdd")
    private boolean add;

    @JsonProperty("isBack")
    private boolean back;

    @JsonProperty("isPrint")
    private boolean print;

    @JsonProperty("isRemove")
    private boolean remove;

    @JsonProperty("isSave")
    private boolean save;

    @JsonProperty("isSearch")
    private boolean search;

    Integer state;
    private Integer rowVersion;
}
