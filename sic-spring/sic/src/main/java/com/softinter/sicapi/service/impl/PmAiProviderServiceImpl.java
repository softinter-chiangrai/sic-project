package com.softinter.sicapi.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.softinter.sicapi.dto.response.AiModelResponse;
import com.softinter.sicapi.service.PmAiProviderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import jakarta.annotation.PostConstruct;

@Slf4j
@Service
public class PmAiProviderServiceImpl implements PmAiProviderService {

    @Value("${app.ai.default-model:gemini-2.5-flash-lite}")
    private String defaultModel;

    // Claude configuration
    @Value("${app.ai.claude.api-key:}")
    private String claudeApiKey;

    @Value("${app.ai.claude.model:claude-3-5-sonnet-20241022}")
    private String claudeModel;

    @Value("${app.ai.claude.api-url:https://api.anthropic.com/v1/messages}")
    private String claudeApiUrl;

    @Value("${app.ai.claude.max-tokens:4096}")
    private int claudeMaxTokens;

    @Value("${app.ai.claude.anthropic-version:2023-06-01}")
    private String anthropicVersion;

    // Gemini configuration
    @Value("${app.ai.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.ai.gemini.model:gemini-2.5-flash-lite}")
    private String geminiModel;

    @Value("${app.ai.gemini.api-url:https://gen.ai.kku.ac.th/upacth/api/v1/chat/completions}")
    private String geminiApiUrl;

    @Value("${app.ai.gemini.max-tokens:4096}")
    private int geminiMaxTokens;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Pattern MERMAID_BLOCK_PATTERN = Pattern.compile("```mermaid\\s*([\\s\\S]*?)```");
    private static final Pattern NAME_PATTERN = Pattern.compile("(?:name|title|ชื่อ)\\s*[:：]\\s*(.+?)(?:\\n|$)", Pattern.CASE_INSENSITIVE);

    @PostConstruct
    public void logConfig() {
        log.info("AI Default Model: {}", defaultModel);
        log.info("AI Claude Model: {}, URL: {}", claudeModel, claudeApiUrl);
        log.info("AI Gemini Model: {}, URL: {}", geminiModel, geminiApiUrl);
    }

    @Override
    public List<AiModelResponse> getAvailableModels() {
        List<AiModelResponse> models = new ArrayList<>();

        models.add(AiModelResponse.builder()
                .id("gemini-2.5-flash-lite")
                .name("Gemini 2.5 Flash Lite")
                .provider("Google (KKU)")
                .description("ประมวลผลรวดเร็ว ตอบสนองฉับไว (แนะนำ)")
                .icon("bi-lightning-charge-fill")
                .recommended(true)
                .build());

        models.add(AiModelResponse.builder()
                .id("gemini-2.5-flash")
                .name("Gemini 2.5 Flash")
                .provider("Google (KKU)")
                .description("ความเร็วสูงและคุณภาพการออกแบบ Diagram ยอดเยี่ยม")
                .icon("bi-stars")
                .recommended(false)
                .build());

        models.add(AiModelResponse.builder()
                .id("claude-3-5-sonnet")
                .name("Claude 3.5 Sonnet")
                .provider("Anthropic")
                .description("คิดวิเคราะห์ลึก แม่นยำสูง สำหรับสถาปัตยกรรมที่ซับซ้อน")
                .icon("bi-cpu-fill")
                .recommended(false)
                .build());

        models.add(AiModelResponse.builder()
                .id("claude-3-7-sonnet")
                .name("Claude 3.7 Sonnet")
                .provider("Anthropic")
                .description("โมเดลอัจฉริยะรุ่นล่าสุด พร้อมความสามารถเชิงตรรกะระดับสูง")
                .icon("bi-robot")
                .recommended(false)
                .build());

        return models;
    }

    private static class ModelConfig {
        String provider; // "claude" or "openai"
        String targetModel;
        String apiUrl;
        String apiKey;
        int maxTokens;
    }

    private ModelConfig resolveModelConfig(String modelId) {
        String effectiveModel = (modelId != null && !modelId.isBlank()) ? modelId.trim() : defaultModel;
        ModelConfig config = new ModelConfig();

        if (effectiveModel.startsWith("claude")) {
            config.provider = "claude";
            config.apiUrl = claudeApiUrl;
            config.apiKey = claudeApiKey;
            config.maxTokens = claudeMaxTokens > 0 ? claudeMaxTokens : 4096;

            if (effectiveModel.equalsIgnoreCase("claude-3-7-sonnet")) {
                config.targetModel = "claude-3-7-sonnet-20250219";
            } else if (effectiveModel.equalsIgnoreCase("claude-3-haiku")) {
                config.targetModel = "claude-3-5-haiku-20241022";
            } else {
                config.targetModel = claudeModel != null && !claudeModel.isBlank() ? claudeModel : "claude-3-5-sonnet-20241022";
            }
        } else {
            // Gemini / OpenAI compatible
            config.provider = "openai";
            config.apiUrl = geminiApiUrl;
            config.apiKey = geminiApiKey;
            config.maxTokens = geminiMaxTokens > 0 ? geminiMaxTokens : 4096;

            if (effectiveModel.equalsIgnoreCase("gemini-2.5-flash")) {
                config.targetModel = "gemini-2.5-flash";
            } else if (effectiveModel.equalsIgnoreCase("gemini-2.5-flash-lite")) {
                config.targetModel = "gemini-2.5-flash-lite";
            } else {
                config.targetModel = geminiModel != null && !geminiModel.isBlank() ? geminiModel : "gemini-2.5-flash-lite";
            }
        }

        return config;
    }

    private String callAiApi(String userPrompt, String systemPrompt, String modelId) {
        ModelConfig config = resolveModelConfig(modelId);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", config.targetModel);
            requestBody.put("temperature", 0.7);

            if ("claude".equalsIgnoreCase(config.provider)) {
                // Anthropic Claude API
                headers.set("x-api-key", config.apiKey != null ? config.apiKey.trim() : "");
                headers.set("anthropic-version", anthropicVersion);

                requestBody.put("max_tokens", config.maxTokens);
                if (systemPrompt != null && !systemPrompt.isBlank()) {
                    requestBody.put("system", systemPrompt);
                }

                List<Map<String, String>> messages = new ArrayList<>();
                messages.add(Map.of("role", "user", "content", userPrompt));
                requestBody.put("messages", messages);
            } else {
                // OpenAI / Gemini (KKU) format
                if (config.apiKey != null && !config.apiKey.isBlank()) {
                    headers.set("Authorization", "Bearer " + config.apiKey.trim());
                }

                List<Map<String, String>> messages = new ArrayList<>();
                if (systemPrompt != null && !systemPrompt.isBlank()) {
                    messages.add(Map.of("role", "system", "content", systemPrompt));
                }
                messages.add(Map.of("role", "user", "content", userPrompt));
                requestBody.put("messages", messages);
                requestBody.put("max_tokens", config.maxTokens);
            }

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(config.apiUrl, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());

                if ("claude".equalsIgnoreCase(config.provider)) {
                    JsonNode contentNode = root.path("content");
                    if (contentNode.isArray() && contentNode.size() > 0) {
                        StringBuilder sb = new StringBuilder();
                        for (JsonNode item : contentNode) {
                            if ("text".equals(item.path("type").asText())) {
                                sb.append(item.path("text").asText());
                            }
                        }
                        return sb.toString();
                    }
                    return contentNode.asText("");
                } else {
                    return root.path("choices").get(0).path("message").path("content").asText();
                }
            }

            log.error("AI API Error HTTP Status: {} for model {}", response.getStatusCode(), config.targetModel);
            return null;

        } catch (HttpStatusCodeException e) {
            log.error("AI API HTTP Error [{}] for model {}: {}", e.getStatusCode(), config.targetModel, e.getResponseBodyAsString());
            return null;
        } catch (Exception e) {
            log.error("AI Service Invocation Error for model {}: {}", config.targetModel, e.getMessage(), e);
            return null;
        }
    }

    @Override
    public String generateResponse(String userMessage, String context) {
        return generateResponse(userMessage, context, null);
    }

    @Override
    public String generateResponse(String userMessage, String context, String modelId) {
        String systemPrompt = """
                You are an expert Mermaid diagram generator and software architect.
                RULES:
                1. Your response MUST contain ONLY a valid Mermaid code block.
                2. The code block MUST start with ```mermaid and end with ```.
                3. Do NOT include any text outside the code block.
                4. If the user asks for a diagram, generate it with clean, well-structured nodes and clear labels.
                5. If the user asks something else, respond with an appropriate diagram.
                6. Supported types: flowchart, sequence, class, er, state, journey, mindmap, timeline, requirement, C4, git, pie, gantt, usecase.
                7. Always use valid Mermaid syntax without syntax errors.
                Current Context:
                %s
                """.formatted(context != null ? context : "");

        String result = callAiApi(userMessage, systemPrompt, modelId);
        if (result != null && !result.isBlank()) {
            return result;
        }

        return "```mermaid\ngraph TD\n  A[Error] --> B[Please check AI API key or configuration]\n```";
    }

    @Override
    public String generateRawResponse(String prompt, String systemPrompt) {
        return generateRawResponse(prompt, systemPrompt, null);
    }

    @Override
    public String generateRawResponse(String prompt, String systemPrompt, String modelId) {
        String effectiveSystemPrompt = (systemPrompt != null && !systemPrompt.isBlank())
                ? systemPrompt
                : "You are a professional software engineering AI assistant specialized in System Analysis, Requirements and Technical Documentation.";

        String result = callAiApi(prompt, effectiveSystemPrompt, modelId);
        if (result != null && !result.isBlank()) {
            return result;
        }

        return "{}";
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
        return "AI Generated Diagram";
    }

    @Override
    public String extractDiagramType(String script) {
        if (script == null || script.isBlank()) return "Flowchart";
        String lower = script.toLowerCase().trim();
        if (lower.startsWith("graph") || lower.startsWith("flowchart")) return "Flowchart";
        if (lower.startsWith("sequencediagram")) return "Sequence";
        if (lower.startsWith("classdiagram")) return "Class";
        if (lower.startsWith("erdiagram")) return "ER";
        if (lower.startsWith("statediagram")) return "State";
        if (lower.startsWith("journey")) return "Journey";
        if (lower.startsWith("mindmap")) return "Mindmap";
        if (lower.startsWith("timeline")) return "Timeline";
        if (lower.startsWith("gantt")) return "Gantt";
        if (lower.startsWith("pie")) return "Pie";
        if (lower.startsWith("gitgraph")) return "Git Graph";
        if (lower.startsWith("c4context") || lower.startsWith("c4container") || lower.startsWith("c4component")) return "C4";
        return "Flowchart";
    }
}