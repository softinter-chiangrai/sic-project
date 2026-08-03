package com.softinter.sicapi.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class RequirementExportRequest {
    private UUID requirementId;
    private String format; // pdf, docx, html
    private Object data; // For real-time preview data
}