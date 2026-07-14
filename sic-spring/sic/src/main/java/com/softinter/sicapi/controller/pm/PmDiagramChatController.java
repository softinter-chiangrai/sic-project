package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.dto.request.PmChatRequest;
import com.softinter.sicapi.dto.response.PmChatResponse;
import com.softinter.sicapi.service.PmDiagramChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/diagram/chat")
@RequiredArgsConstructor
public class PmDiagramChatController {

    private final PmDiagramChatService chatService;

    @GetMapping("/{diagramId}/history")
    public ResponseEntity<List<PmChatResponse>> getChatHistory(@PathVariable UUID diagramId) {
        return ResponseEntity.ok(chatService.getChatHistory(diagramId));
    }

    @DeleteMapping("/{diagramId}/history")
    public ResponseEntity<Void> clearChatHistory(@PathVariable UUID diagramId) {
        chatService.clearChatHistory(diagramId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<PmChatResponse> sendMessage(@Valid @RequestBody PmChatRequest request) {
        return ResponseEntity.ok(chatService.sendMessage(request));
    }
}