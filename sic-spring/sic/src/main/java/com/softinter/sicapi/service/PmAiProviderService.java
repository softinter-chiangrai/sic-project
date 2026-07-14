package com.softinter.sicapi.service;

public interface PmAiProviderService {

    String generateResponse(String userMessage, String context);

    String extractMermaidScript(String aiResponse);

    String extractDiagramName(String aiResponse);

    String extractDiagramType(String script);
}