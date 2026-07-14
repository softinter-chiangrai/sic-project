package com.softinter.sicapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class PmChatRequest {
    @NotNull(message = "Diagram ID is required")
    private UUID diagramId;

    @NotBlank(message = "Message is required")
    private String message;

    private String context;
}