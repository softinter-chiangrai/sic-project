package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class SpecificationDraft {
    private String title;
    private String objective;
    private String scope;
    private String description;
    private String priority;
    private Integer estimatedManday;
    private List<ScreenDto> screens;
    private List<FieldDto> fields;
    private List<ValidationDto> validations;
    private List<BusinessRuleDto> businessRules;
    private List<ApiDto> apis;

    @Data
    public static class ScreenDto {
        private String screenName;
        private String description;
        private String navigation;
    }

    @Data
    public static class FieldDto {
        private String fieldName;
        private String dataType;
        private Boolean isRequired;
        private Integer maxLength;
        private String description;
    }

    @Data
    public static class ValidationDto {
        private String validationType;
        private String rule;
        private String errorMessage;
    }

    @Data
    public static class BusinessRuleDto {
        private String ruleName;
        private String description;
        private String severity;
    }

    @Data
    public static class ApiDto {
        private String method;
        private String url;
        private String description;
        private String authentication;
    }
}