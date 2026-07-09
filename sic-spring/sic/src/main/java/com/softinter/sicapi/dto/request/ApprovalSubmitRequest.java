package com.softinter.sicapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ApprovalSubmitRequest {

    @NotBlank(message = "Document type is required")
    private String documentType;

    @NotNull(message = "Document ID is required")
    private UUID documentId;

    private String documentCode;
    private String documentTitle;
    private String version;
    private String comment;
    private UUID attachmentId;

    @NotNull(message = "Flow ID is required")
    private UUID flowId;

    // Extra data for specific document types
    private String extraData;
}