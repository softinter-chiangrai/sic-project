package com.softinter.sicapi.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class SaveMessageRequest {
    private UUID id;              // ถ้ามี = Update, ไม่มี = Create
    private String moduleCode;
    private String programCode;
    private String messageCode;
    private String messageEn;
    private String messageLocal;
    private Boolean isActive;
    private String createdBy;
    private String updatedBy;
}
