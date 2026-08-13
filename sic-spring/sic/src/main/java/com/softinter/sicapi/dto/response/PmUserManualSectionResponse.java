package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.util.UUID;

@Data
public class PmUserManualSectionResponse {
    private UUID id;
    private UUID manualId;
    private String sectionCode;
    private String sectionTitle;
    private String content;
    private Integer sortOrder;
    private String permissionRoles;
    private UUID screenshotGroupId;
    private Integer rowVersion;
}
