package com.softinter.sicapi.dto.request;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class SaveRolePermissionsRequest {
    private UUID roleId;
    private List<SaveBusinessRoleProgramRequest> modules;
}
