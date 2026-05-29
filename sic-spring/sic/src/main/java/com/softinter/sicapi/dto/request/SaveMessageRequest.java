package com.softinter.sicapi.dto.request;

import com.softinter.sicapi.entity.base.BaseEntity;
import lombok.Data;

import java.util.UUID;

@Data
public class SaveMessageRequest {
    private UUID id;
    private String module;
    private String messageKey;
    private String messageEn;
    private String messageLocal;
    private boolean isActive = true;
    private BaseEntity.EntityState state = BaseEntity.EntityState.DETACHED;
    private Long rowVersion;
}
