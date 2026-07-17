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
import jakarta.annotation.PostConstruct; 

@Slf4j
@Service
public class PmAiProviderServiceImpl implements PmAiProviderService {

    @Value("${app.ai.provider:gemini}")
    private String provider;

    @Value("${app.ai.api-key:}")
    private String apiKey;

    @Value("${app.ai.model:gemini-2.5-flash-lite}")
    private String model;

    @Value("${app.ai.api-url:https://gen.ai.kku.ac.th/upacth/api/v1/chat/completions}")
    private String apiUrl;

     @PostConstruct
    public void logConfig() {
        log.info("AI API URL: {}", apiUrl);
        log.info("AI Model: {}", model);
        log.info("AI Provider: {}", provider);
    }

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Pattern MERMAID_BLOCK_PATTERN = Pattern.compile("```mermaid\\s*([\\s\\S]*?)```");
    private static final Pattern NAME_PATTERN = Pattern.compile("(?:name|title|ชื่อ)\\s*[:：]\\s*(.+?)(?:\\n|$)", Pattern.CASE_INSENSITIVE);

    @Override
    public String generateResponse(String userMessage, String context) {
        // ✅ บังคับให้ AI ตอบเฉพาะ Mermaid code block เท่านั้น
        String systemPrompt = """
                You are a Mermaid diagram generator.
                RULES:
                1. Your response MUST contain ONLY a valid Mermaid code block.
                2. The code block MUST start with ```mermaid and end with ```.
                3. Do NOT include any text outside the code block.
                4. If the user asks for a diagram, generate it.
                5. If the user asks something else, still respond with a default diagram.
                6. Supported types: flowchart, sequence, class, er, state, journey, mindmap, timeline, requirement, C4, git, pie, gantt.
                7. Always use correct Mermaid syntax.
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
            return "```mermaid\ngraph TD\n  A[Error] --> B[Please try again]\n```";

        } catch (Exception e) {
            log.error("AI service error", e);
            return "```mermaid\ngraph TD\n  A[Error] --> B[Check API configuration]\n```";
        }
    }

    @Override
    public String extractMermaidScript(String aiResponse) {
        if (aiResponse == null) return null;
        Matcher matcher = MERMAID_BLOCK_PATTERN.matcher(aiResponse);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        return null;
    }

    @Override
    public String extractDiagramName(String aiResponse) {
        if (aiResponse == null) return "AI Generated Diagram";
        Matcher matcher = NAME_PATTERN.matcher(aiResponse);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        // fallback: ถ้าไม่มีชื่อ ให้ดูในบรรทัดแรกของ mermaid script
        String script = extractMermaidScript(aiResponse);
        if (script != null) {
            String firstLine = script.split("\n")[0].trim();
            if (firstLine.startsWith("graph") || firstLine.startsWith("flowchart")) {
                return "Flowchart";
            }
            if (firstLine.startsWith("sequenceDiagram")) return "Sequence Diagram";
            if (firstLine.startsWith("classDiagram")) return "Class Diagram";
            if (firstLine.startsWith("erDiagram")) return "ER Diagram";
            if (firstLine.startsWith("stateDiagram")) return "State Diagram";
            if (firstLine.startsWith("journey")) return "Journey";
            if (firstLine.startsWith("mindmap")) return "Mindmap";
            if (firstLine.startsWith("timeline")) return "Timeline";
            if (firstLine.startsWith("requirementDiagram")) return "Requirement Diagram";
            if (firstLine.startsWith("C4Context")) return "C4 Context";
            if (firstLine.startsWith("gitGraph")) return "Git Graph";
            if (firstLine.startsWith("pie")) return "Pie Chart";
            if (firstLine.startsWith("gantt")) return "Gantt Chart";
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