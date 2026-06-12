package com.softinter.sicapi.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class SaveUserBusinessRoleRequest {
    private UUID id;
    private UUID userBusinessId;
    private UUID businessRoleId;
    private boolean isActive = true;
    private Integer rowVersion;
}
