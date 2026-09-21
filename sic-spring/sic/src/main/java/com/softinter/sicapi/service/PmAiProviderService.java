package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.AiAttachmentDto;
import com.softinter.sicapi.dto.response.AiModelResponse;

import java.util.List;

public interface PmAiProviderService {

    List<AiModelResponse> getAvailableModels();

    String generateResponse(String userMessage, String context);

    String generateResponse(String userMessage, String context, String modelId);

    String generateRawResponse(String prompt, String systemPrompt);

    String generateRawResponse(String prompt, String systemPrompt, String modelId);

    /**
     * Same as {@link #generateRawResponse(String, String, String)} but lets the caller attach
     * files/images (e.g. a spec document or a screenshot) that get folded into the prompt:
     * images are sent as real vision content blocks to models that support it, text-like files
     * (txt/csv/json/md) are decoded and inlined, everything else is referenced by name only.
     */
    String generateRawResponse(String prompt, String systemPrompt, String modelId, List<AiAttachmentDto> attachments);

    String extractMermaidScript(String aiResponse);

    String extractDiagramName(String aiResponse);

    String extractDiagramType(String script);
}