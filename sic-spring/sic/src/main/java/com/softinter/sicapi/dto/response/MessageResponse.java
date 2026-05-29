package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.util.UUID;

@Data
public class MessageResponse {
    private UUID id;
    private String module;
    private String messageKey;
    private String messageEn;
    private String messageLocal;
    private boolean isActive;
    private Long rowVersion;
}
