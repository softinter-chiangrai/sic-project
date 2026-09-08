package com.softinter.sicapi.dto.response;

import lombok.Data;

@Data
public class RequirementDraft {
    private String title;
    private String description;
    private String acceptanceCriteria;
    private String businessValue;
    private String requirementType;
    private String priority;
}
