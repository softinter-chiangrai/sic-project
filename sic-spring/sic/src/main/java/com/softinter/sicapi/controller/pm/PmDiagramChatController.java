package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.dto.request.PmChatRequest;
import com.softinter.sicapi.dto.response.PmChatResponse;
import com.softinter.sicapi.dto.response.PmDiagramChatSessionResponse;
import com.softinter.sicapi.service.PmDiagramChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/diagram/chat")
@RequiredArgsConstructor
public class PmDiagramChatController {

    private final PmDiagramChatService chatService;

    @GetMapping("/{diagramId}/sessions")
    public ResponseEntity<List<PmDiagramChatSessionResponse>> getSessions(@PathVariable UUID diagramId) {
        return ResponseEntity.ok(chatService.getSessions(diagramId));
    }

    @GetMapping("/{diagramId}/history")
    public ResponseEntity<List<PmChatResponse>> getChatHistory(
            @PathVariable UUID diagramId,
            @RequestParam(required = false) UUID sessionId) {
        if (sessionId != null) {
            return ResponseEntity.ok(chatService.getChatHistoryBySession(diagramId, sessionId));
        }
        return ResponseEntity.ok(chatService.getChatHistory(diagramId));
    }

    @DeleteMapping("/{diagramId}/history")
    public ResponseEntity<Void> clearChatHistory(@PathVariable UUID diagramId) {
        chatService.clearChatHistory(diagramId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{diagramId}/sessions/{sessionId}")
    public ResponseEntity<Void> deleteSession(
            @PathVariable UUID diagramId,
            @PathVariable UUID sessionId) {
        chatService.deleteSession(diagramId, sessionId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{diagramId}/sessions/{sessionId}/title")
    public ResponseEntity<Void> renameSession(
            @PathVariable UUID diagramId,
            @PathVariable UUID sessionId,
            @RequestBody Map<String, String> body) {
        String title = body.get("title");
        if (title != null && !title.isBlank()) {
            chatService.renameSession(diagramId, sessionId, title);
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<PmChatResponse> sendMessage(@Valid @RequestBody PmChatRequest request) {
        return ResponseEntity.ok(chatService.sendMessage(request));
    }
}