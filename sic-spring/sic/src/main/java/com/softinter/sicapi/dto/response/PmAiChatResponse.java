package com.softinter.sicapi.dto.response;

import lombok.Data;

@Data
public class PmAiChatResponse {
    private String message;
    private DiagramAction diagram;

    @Data
    public static class DiagramAction {
        private String action; 
        private String name;
        private String type;
        private String script;
    }
}