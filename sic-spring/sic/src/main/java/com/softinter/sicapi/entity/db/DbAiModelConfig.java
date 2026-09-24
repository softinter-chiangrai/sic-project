package com.softinter.sicapi.entity.db;

import com.softinter.sicapi.config.AiApiKeyConverter;
import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "db_ai_model_config")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class DbAiModelConfig extends BaseEntity {

    // รหัส model ที่จะถูกส่งไปยัง provider API ตรง ๆ (เช่น "gemini-2.5-flash-lite") และใช้เป็น value ที่เลือกใน combobox ด้วย
    @Column(name = "model_code", nullable = false, length = 150, unique = true)
    private String modelCode;

    @Column(name = "display_name", nullable = false, length = 255)
    private String displayName;

    // ป้ายชื่อ provider ที่โชว์ใน UI เช่น "Anthropic (KKU)", "Google (KKU)"
    @Column(name = "provider_label", nullable = false, length = 100)
    private String providerLabel;

    // รูปแบบ request/response ที่ใช้ยิง API จริง: CLAUDE หรือ OPENAI_COMPATIBLE
    @Column(name = "api_format", nullable = false, length = 30)
    private String apiFormat;

    @Column(name = "api_url", nullable = false, length = 500)
    private String apiUrl;

    @Convert(converter = AiApiKeyConverter.class)
    @Column(name = "api_key", length = 1000)
    private String apiKey;

    @Column(name = "max_tokens")
    private Integer maxTokens = 4096;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "icon", length = 100)
    private String icon;

    @Column(name = "is_recommended")
    private Boolean isRecommended = false;

    @Column(name = "is_default")
    private Boolean isDefault = false;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "sort_order")
    private Integer sortOrder = 1;
}
