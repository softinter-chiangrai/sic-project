package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
public class PmSpecificationResponse {
    private UUID id;
    private String specificationCode;
    private String title;
    private String module;
    private String version;
    private String status;
    private String priority;
    private String owner;
    private Integer estimatedManday;
    private String objective;
    private String scope;
    private String description;
    private String remark;
    private UUID uploadGroupId;
    private Boolean isAiGenerated;
    private Instant aiGeneratedAt;
    private UUID generatedFromRequirementId;
    private UUID generatedFromDiagramId;
    private Integer rowVersion;
    private Instant createdDate;
    private Instant updatedDate;

    // Nested data (Requirements ยังคงเหมือนเดิม)
    private List<RequirementResponse> requirements;
    private List<ScreenResponse> screens;
    private List<FieldResponse> fields;
    private List<ValidationResponse> validations;
    private List<BusinessRuleResponse> businessRules;
    private List<ApiResponse> apis;

    @Data
    public static class RequirementResponse {
        private UUID id;
        private UUID requirementId;
        private String requirementCode;
        private String requirementTitle;
    }

    @Data
    public static class ScreenResponse {
        private UUID id;
        private String screenName;
        private String description;
        private String navigation;
        private String mockupUrl;
    }

    @Data
    public static class FieldResponse {
        private UUID id;
        private String fieldName;
        private String dataType;
        private Boolean isRequired;
        private Integer maxLength;
        private String defaultValue;
        private String description;
    }

    @Data
    public static class ValidationResponse {
        private UUID id;
        private String validationType;
        private String rule;
        private String errorMessage;
    }

    @Data
    public static class BusinessRuleResponse {
        private UUID id;
        private String ruleName;
        private String description;
        private String severity;
    }

    @Data
    public static class ApiResponse {
        private UUID id;
        private String httpMethod;
        private String url;
        private Object requestSchema;
        private Object responseSchema;
        private String authentication;
    }
}