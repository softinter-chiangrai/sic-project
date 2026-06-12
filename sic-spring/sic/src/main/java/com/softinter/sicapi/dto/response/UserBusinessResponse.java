package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.util.UUID;

@Data
public class UserBusinessResponse {
    private UUID id;
    private String userId;
    private UUID businessId;
    private String businessCode;
    private String businessName;
    private boolean isActive;
    private boolean isDefault;
    private Integer rowVersion;
}
