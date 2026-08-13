package com.softinter.sicapi.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class PmUserManualSectionRequest {
    private UUID id;
    private UUID manualId;
    private String sectionCode;
    private String sectionTitle;
    private String content;
    private Integer sortOrder;
    private String permissionRoles;
    private UUID screenshotGroupId;
    private Integer state;
    private Integer rowVersion;
}
