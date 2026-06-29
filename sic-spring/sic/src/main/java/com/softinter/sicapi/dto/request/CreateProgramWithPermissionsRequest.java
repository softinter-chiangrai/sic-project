// src/main/java/com/softinter/sicapi/dto/request/CreateProgramWithPermissionsRequest.java

package com.softinter.sicapi.dto.request;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class CreateProgramWithPermissionsRequest {
    // ข้อมูลโปรแกรม
    private UUID parentProgramId;
    private String programCode;
    private String programNameEn;
    private String programNameLocal;
    private String programIcon;
    private String routePath;
    private Integer sortOrder;
    private boolean isActive;

    // สิทธิ์เริ่มต้นให้แต่ละบทบาท
    private List<RolePermissionDto> rolePermissions;

    @Data
    public static class RolePermissionDto {
        private UUID roleId;
        private String level;  // Full, Edit, Approve, View, None
    }
}