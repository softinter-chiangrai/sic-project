package com.softinter.sicapi.dto.request;

import java.util.UUID;

import lombok.Data;

@Data
public class AiGenerateSqlRequest {
    private String xml;
    private String vendor; 
    private String pageName;
    private String tabId;
    private String mode; // 'FULL' or 'MIGRATION'
    private String engine; // 'ai' or 'parser'
    private UUID baseVersionId; // Specific version ID to compare against (optional)
}