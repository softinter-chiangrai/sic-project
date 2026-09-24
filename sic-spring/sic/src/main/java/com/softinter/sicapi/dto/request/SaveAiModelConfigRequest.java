package com.softinter.sicapi.dto.request;

import java.util.UUID;

import lombok.Data;

@Data
public class SaveAiModelConfigRequest {
    private UUID id;
    private String modelCode;
    private String displayName;
    private String providerLabel;
    private String apiFormat; // CLAUDE | OPENAI_COMPATIBLE
    private String apiUrl;
    // เว้นว่าง = ไม่เปลี่ยน key เดิม (ใช้ตอนแก้ไขเท่านั้น); ตอนสร้างใหม่ต้องใส่
    private String apiKey;
    private Integer maxTokens;
    private String description;
    private String icon;
    private Boolean isRecommended;
    private Boolean isDefault;
    private Boolean isActive;
    private Integer sortOrder;
    private Integer rowVersion;
}
