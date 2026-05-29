package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.util.UUID;

@Data
public class ChangeBusinessResponse {
    private String userId;
    private String username;
    private UUID businessId;
    private String businessName;
    private boolean changed;
}
