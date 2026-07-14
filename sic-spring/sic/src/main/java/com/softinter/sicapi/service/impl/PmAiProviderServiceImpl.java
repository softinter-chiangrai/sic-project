package com.softinter.sicapi.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.softinter.sicapi.service.PmAiProviderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class PmAiProviderServiceImpl implements PmAiProviderService {

    @Value("${app.ai.provider:openai}")
    private String provider;

    @Value("${app.ai.api-key:}")
    private String apiKey;

    @Value("${app.ai.model:gpt-4}")
    private String model;

    @Value("${app.ai.api-url:https://api.openai.com/v1/chat/completions}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String generateResponse(String userMessage, String context) {
        String systemPrompt = """
                You are an expert diagram designer and Mermaid.js specialist.
                Generate valid Mermaid diagrams based on user requests.
                
                Guidelines:
                1. Only output Mermaid code inside ```mermaid ... ``` blocks
                2. Add a brief explanation before the code block
                3. Use proper Mermaid syntax for the diagram type
                4. If the user asks to modify an existing diagram, understand the context
                5. If creating a new diagram, suggest an appropriate name and type
                6. If you detect a Mermaid error in the context, suggest a fix
                
                Diagram Types:
                - Flowchart: graph TD or flowchart TD
                - Sequence: sequenceDiagram
                - Class: classDiagram
                - ER: erDiagram
                - State: stateDiagram-v2
                - Journey: journey
                - Mindmap: mindmap
                - Timeline: timeline
                - Requirement: requirementDiagram
                - C4: C4Context
                - Git Graph: gitGraph
                - Pie: pie
                - Gantt: gantt
                
                Current Context:
                %s
                """.formatted(context);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("messages", new Object[]{
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userMessage)
        });
        requestBody.put("temperature", 0.7);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                JsonNode root = objectMapper.readTree(response.getBody());
                String content = root.path("choices").get(0).path("message").path("content").asText();
                return content;
            }

            log.error("AI API error: {}", response.getStatusCode());
            return "I'm sorry, I'm having trouble generating a response right now. Please try again.";

        } catch (Exception e) {
            log.error("AI service error", e);
            return "I encountered an error. Please check your API configuration and try again.";
        }
    }

    @Override
    public String extractMermaidScript(String aiResponse) {
        Pattern pattern = Pattern.compile("```mermaid\\s*([\\s\\S]*?)```");
        Matcher matcher = pattern.matcher(aiResponse);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        return null;
    }

    @Override
    public String extractDiagramName(String aiResponse) {
        String lower = aiResponse.toLowerCase();
        if (lower.contains("name:")) {
            int idx = lower.indexOf("name:");
            int end = lower.indexOf("\n", idx);
            if (end == -1) end = lower.indexOf(".", idx);
            if (end == -1) end = Math.min(idx + 50, lower.length());
            return aiResponse.substring(idx + 5, end).trim();
        }
        if (lower.contains("title:")) {
            int idx = lower.indexOf("title:");
            int end = lower.indexOf("\n", idx);
            if (end == -1) end = lower.indexOf(".", idx);
            if (end == -1) end = Math.min(idx + 50, lower.length());
            return aiResponse.substring(idx + 6, end).trim();
        }
        return "AI Generated Diagram";
    }

    @Override
    public String extractDiagramType(String script) {
        if (script == null) return "Flowchart";

        String lower = script.toLowerCase().trim();
        if (lower.startsWith("sequence")) return "Sequence";
        if (lower.startsWith("classdiagram")) return "Class";
        if (lower.startsWith("erdiagram") || lower.startsWith("er")) return "ER";
        if (lower.startsWith("state")) return "State";
        if (lower.startsWith("journey")) return "Journey";
        if (lower.startsWith("mindmap")) return "Mindmap";
        if (lower.startsWith("timeline")) return "Timeline";
        if (lower.startsWith("requirement")) return "Requirement";
        if (lower.startsWith("c4")) return "C4";
        if (lower.startsWith("git")) return "Git Graph";
        if (lower.startsWith("pie")) return "Pie";
        if (lower.startsWith("gantt")) return "Gantt";
        if (lower.contains("graph") || lower.contains("flowchart")) return "Flowchart";

        return "Flowchart";
    }
}