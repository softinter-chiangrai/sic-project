package com.softinter.sicapi.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class SaveUserBusinessRequest {
    private UUID id;
    private String userId;
    private UUID businessId;
    private boolean isActive = true;
    private boolean isDefault = false;
    private Integer rowVersion;
}
