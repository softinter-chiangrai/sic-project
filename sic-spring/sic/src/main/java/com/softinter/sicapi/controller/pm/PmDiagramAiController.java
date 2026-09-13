package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.dto.response.AiModelResponse;
import com.softinter.sicapi.service.PmAiProviderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class PmDiagramAiController {

    private final PmAiProviderService aiProviderService;

    @GetMapping("/models")
    public ResponseEntity<List<AiModelResponse>> getAvailableModels() {
        return ResponseEntity.ok(aiProviderService.getAvailableModels());
    }

    @PostMapping("/generate-mermaid")
    public ResponseEntity<Map<String, String>> generateMermaid(@RequestBody Map<String, String> request) {
        String prompt = request.get("prompt");
        String model = request.get("model");
        if (prompt == null || prompt.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Generate response using AI
        String aiResponse = aiProviderService.generateResponse(prompt, "Generating a new diagram.", model);
        String mermaid = aiProviderService.extractMermaidScript(aiResponse);

        if (mermaid == null) {
            mermaid = aiResponse;
        }

        Map<String, String> response = new HashMap<>();
        response.put("mermaid", mermaid);
        return ResponseEntity.ok(response);
    }
}
