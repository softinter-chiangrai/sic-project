package com.softinter.sicapi.dto.request;

import lombok.Data;

@Data
public class AiNavigatorChatRequest {
    private String message;
    private String currentPath;
    private String model;
}
