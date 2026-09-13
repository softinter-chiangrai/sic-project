package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.response.AiModelResponse;

import java.util.List;

public interface PmAiProviderService {

    List<AiModelResponse> getAvailableModels();

    String generateResponse(String userMessage, String context);

    String generateResponse(String userMessage, String context, String modelId);

    String generateRawResponse(String prompt, String systemPrompt);

    String generateRawResponse(String prompt, String systemPrompt, String modelId);

    String extractMermaidScript(String aiResponse);

    String extractDiagramName(String aiResponse);

    String extractDiagramType(String script);
}