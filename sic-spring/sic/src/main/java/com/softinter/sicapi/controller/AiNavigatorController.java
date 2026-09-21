package com.softinter.sicapi.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.softinter.sicapi.dto.request.AiNavigatorChatRequest;
import com.softinter.sicapi.dto.response.AiNavigatorChatResponse;
import com.softinter.sicapi.service.AiNavigatorService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/ai/navigator")
@RequiredArgsConstructor
@Slf4j
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "AI Navigator", description = "Global AI Assistant สำหรับตอบคำถาม Workflow และพาวาร์ปไปยังหน้าต่างๆ")
public class AiNavigatorController {

    private final AiNavigatorService navigatorService;

    @PostMapping("/chat")
    @Operation(summary = "ถาม-ตอบ Workflow และรับคำแนะนำเส้นทางนำทาง")
    public ResponseEntity<AiNavigatorChatResponse> chat(@RequestBody AiNavigatorChatRequest request) {
        try {
            return ResponseEntity.ok(navigatorService.chat(request));
        } catch (Exception e) {
            log.error("AI Navigator chat failed", e);
            AiNavigatorChatResponse error = AiNavigatorChatResponse.builder()
                    .answer("เกิดข้อผิดพลาด: " + e.getMessage())
                    .suggestedRoutes(java.util.List.of())
                    .build();
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
