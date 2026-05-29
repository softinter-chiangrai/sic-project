package com.softinter.sicapi.controller.su;

import com.softinter.sicapi.dto.request.*;
import com.softinter.sicapi.dto.response.*;
import com.softinter.sicapi.entity.su.SuMessage;
import com.softinter.sicapi.repository.su.SuMessageRepository;
import com.softinter.sicapi.service.MessageI18nCache;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/su/messages")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Message", description = "I18N Message Management API")
public class MessageController {

    private final SuMessageRepository messageRepository;
    private final MessageI18nCache messageI18nCache;

    @GetMapping("/i18n/{module}")
    @Operation(summary = "Get i18n messages for module")
    public ResponseEntity<ApiResponse<I18nMessageResponse>> getI18NMessages(@PathVariable String module) {
        Map<String, String> messages = messageI18nCache.getMessages(module);
        I18nMessageResponse response = new I18nMessageResponse();
        response.setModule(module);
        response.setMessages(messages);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @Operation(summary = "Get messages by module")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getMessages(
            @RequestParam(required = false) String module) {
        List<SuMessage> messages;
        if (module != null) {
            messages = messageRepository.findByModuleAndIsActiveTrueOrderByMessageKey(module);
        } else {
            messages = messageRepository.findAll();
        }
        List<MessageResponse> response = messages.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/save")
    @Operation(summary = "Save message")
    public ResponseEntity<ApiResponse<UUID>> save(@Valid @RequestBody SaveMessageRequest request) {
        SuMessage message;
        if (request.getId() != null) {
            message = messageRepository.findById(request.getId())
                    .orElseThrow(() -> new RuntimeException("Message not found"));
        } else {
            message = new SuMessage();
        }
        message.setModule(request.getModule());
        message.setMessageKey(request.getMessageKey());
        message.setMessageEn(request.getMessageEn());
        message.setMessageLocal(request.getMessageLocal());
        message.setIsActive(request.isActive());
        messageRepository.save(message);

        messageI18nCache.evictModule(request.getModule());
        return ResponseEntity.ok(ApiResponse.success(message.getId()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete message")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        SuMessage message = messageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        String module = message.getModule();
        message.setIsActive(false);
        message.setIsDelete(true);
        messageRepository.save(message);
        messageI18nCache.evictModule(module);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    private MessageResponse toResponse(SuMessage message) {
        MessageResponse response = new MessageResponse();
        response.setId(message.getId());
        response.setModule(message.getModule());
        response.setMessageKey(message.getMessageKey());
        response.setMessageEn(message.getMessageEn());
        response.setMessageLocal(message.getMessageLocal());
        response.setActive(Boolean.TRUE.equals(message.getIsActive()));
        response.setRowVersion(message.getRowVersion());
        return response;
    }
}
