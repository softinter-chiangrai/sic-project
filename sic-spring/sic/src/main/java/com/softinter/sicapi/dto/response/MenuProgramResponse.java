package com.softinter.sicapi.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.UUID;

@Data
public class MenuProgramResponse {

    private UUID id;
    private UUID parentProgramId;
    private String programCode;
    private String icon;
    private String nameEn;
    private String nameLocal;
    private String routePath;
    private Integer sortOrder;
    private Boolean isActive;
    private Integer rowVersion;
    private Integer state;

    // ✅ ใช้ @JsonProperty ให้ชื่อ field ตรงกับ .NET
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

    // Constructor
    public MenuProgramResponse(UUID id, UUID parentProgramId, String programCode, String icon,
                               String nameEn, String nameLocal, String routePath, Integer sortOrder,
                               Boolean isActive, Integer rowVersion, int state,
                               boolean isAdd, boolean isBack, boolean isPrint, boolean isRemove,
                               boolean isSave, boolean isSearch) {
        this.id = id;
        this.parentProgramId = parentProgramId;
        this.programCode = programCode;
        this.icon = icon;
        this.nameEn = nameEn;
        this.nameLocal = nameLocal;
        this.routePath = routePath;
        this.sortOrder = sortOrder;
        this.isActive = isActive;
        this.rowVersion = rowVersion;
        this.state = state;
        this.add = isAdd;
        this.back = isBack;
        this.print = isPrint;
        this.remove = isRemove;
        this.save = isSave;
        this.search = isSearch;
    }
}