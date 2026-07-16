package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.service.PmAiProviderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class PmDiagramAiController {

    private final PmAiProviderService aiProviderService;

    @PostMapping("/generate-mermaid")
    public ResponseEntity<Map<String, String>> generateMermaid(@RequestBody Map<String, String> request) {
        String prompt = request.get("prompt");
        if (prompt == null || prompt.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Generate response using AI
        String aiResponse = aiProviderService.generateResponse(prompt, "Generating a new diagram.");
        String mermaid = aiProviderService.extractMermaidScript(aiResponse);

        if (mermaid == null) {
            // Fallback: try to return the raw response if it doesn't contain code blocks
            mermaid = aiResponse;
        }

        Map<String, String> response = new HashMap<>();
        response.put("mermaid", mermaid);
        return ResponseEntity.ok(response);
    }
}
