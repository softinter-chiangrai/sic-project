package com.softinter.sicapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class DocumentVersionRequest {
    private UUID id;

    @NotBlank(message = "Document type is required")
    private String documentType;

    @NotNull(message = "Document ID is required")
    private UUID documentId;

    @NotBlank(message = "Version number is required")
    private String versionNo;

    private String changeSummary;
    private String filePath;
    private Boolean isActive;
}