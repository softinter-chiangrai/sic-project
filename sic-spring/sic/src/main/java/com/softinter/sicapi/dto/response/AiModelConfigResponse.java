package com.softinter.sicapi.dto.response;

import java.time.Instant;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO สำหรับหน้าจัดการ model (admin) เท่านั้น — apiKeyMasked โชว์แค่ 4 ตัวท้าย
 * ไม่มี field ไหนคืนค่า api key เต็มออกไปให้ frontend เห็นเด็ดขาด
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiModelConfigResponse {
    private UUID id;
    private String modelCode;
    private String displayName;
    private String providerLabel;
    private String apiFormat;
    private String apiUrl;
    private String apiKeyMasked;

    @JsonProperty("hasApiKey")
    private boolean hasApiKey;

    private Integer maxTokens;
    private String description;
    private String icon;

    @JsonProperty("isRecommended")
    private boolean isRecommended;

    @JsonProperty("isDefault")
    private boolean isDefault;

    @JsonProperty("isActive")
    private boolean isActive;

    private Integer sortOrder;
    private Integer rowVersion;
    private Instant updatedDate;
}
