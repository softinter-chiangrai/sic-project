package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.util.UUID;

@Data
public class BusinessDto {
    private UUID id;
    private String code;
    private String name;
    private UUID uploadGroupId;
    private boolean isDefault;
}
