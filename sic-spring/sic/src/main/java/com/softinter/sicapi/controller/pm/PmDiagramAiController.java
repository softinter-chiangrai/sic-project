package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.dto.response.AiModelResponse;
import com.softinter.sicapi.service.PmAiProviderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.softinter.sicapi.util.MermaidToDrawio;

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

    /** แปลง Mermaid (flowchart/erDiagram) เป็น XML ของ draw.io ให้หน้าเว็บ merge เข้าแผนภาพที่เปิดอยู่ */
    @PostMapping("/mermaid-to-drawio")
    public ResponseEntity<Map<String, String>> mermaidToDrawio(@RequestBody Map<String, String> request) {
        try {
            MermaidToDrawio.Result result = MermaidToDrawio.convert(request.get("mermaid"));
            return ResponseEntity.ok(Map.of("type", result.type(), "xml", result.xml()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.unprocessableEntity().body(Map.of("message", e.getMessage()));
        }
    }
}
