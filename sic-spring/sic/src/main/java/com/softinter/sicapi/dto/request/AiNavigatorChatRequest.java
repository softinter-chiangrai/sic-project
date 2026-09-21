package com.softinter.sicapi.dto.request;

import java.util.List;

import lombok.Data;

@Data
public class AiNavigatorChatRequest {
    private String message;
    private String currentPath;
    private String model;
    private List<AiAttachmentDto> attachments;
}

