package com.softinter.sicapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class PmSpecificationRequest {
    private UUID id;
    private Integer state;
    private Integer rowVersion;

    @NotBlank(message = "รหัส Specification ห้ามว่าง")
    private String specificationCode;

    @NotBlank(message = "ชื่อเรื่องห้ามว่าง")
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

    // Child data (ยังคงใช้ RequirementLinkDto)
    private List<RequirementLinkDto> requirements;
    private List<ScreenDto> screens;
    private List<FieldDto> fields;
    private List<ValidationDto> validations;
    private List<BusinessRuleDto> businessRules;
    private List<ApiDto> apis;

    @Data
    public static class RequirementLinkDto {
        private UUID requirementId;
    }

    @Data
    public static class ScreenDto {
        private String id;
        private String screenName;
        private String description;
        private String navigation;
        private String mockupUrl;
        private Integer state;
        private Integer rowVersion;
    }

    @Data
    public static class FieldDto {
        private String id;
        private String fieldName;
        private String dataType;
        private Boolean isRequired;
        private Integer maxLength;
        private String defaultValue;
        private String description;
        private Integer state;
        private Integer rowVersion;
    }

    @Data
    public static class ValidationDto {
        private String id;
        private String validationType;
        private String rule;
        private String errorMessage;
        private Integer state;
        private Integer rowVersion;
    }

    @Data
    public static class BusinessRuleDto {
        private String id;
        private String ruleName;
        private String description;
        private String severity;
        private Integer state;
        private Integer rowVersion;
    }

    @Data
    public static class ApiDto {
        private String id;
        private String httpMethod;
        private String url;
        private Object requestSchema;
        private Object responseSchema;
        private String authentication;
        private Integer state;
        private Integer rowVersion;
    }
}