package com.softinter.sicapi.dto.request;

import lombok.Data;

@Data
public class AiDbValidationRequest {
    private String xml;
    private String vendor; // postgresql, mysql, etc.
    private String pageName;
    private String tabId;
    private String lang; // 'th' or 'en'
    private String model;
}
