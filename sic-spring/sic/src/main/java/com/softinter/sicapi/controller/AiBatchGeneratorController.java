package com.softinter.sicapi.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.softinter.sicapi.dto.request.AiBatchGenerateRequest;
import com.softinter.sicapi.dto.response.AiBatchGenerateResponse;
import com.softinter.sicapi.service.AiBatchGeneratorService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "AI Batch Generator", description = "สร้างข้อมูลหลายรายการพร้อมกันด้วย AI (Append Only) สำหรับหน้า List/Detail ทุกโมดูล")
public class AiBatchGeneratorController {

    private final AiBatchGeneratorService batchGeneratorService;

    @PostMapping("/batch-generate")
    @Operation(summary = "สร้างข้อมูลชุดหลายรายการด้วย AI ตาม moduleType ที่ระบุ")
    public ResponseEntity<AiBatchGenerateResponse> batchGenerate(@RequestBody AiBatchGenerateRequest request) {
        try {
            return ResponseEntity.ok(batchGeneratorService.generate(request));
        } catch (Exception e) {
            log.error("AI batch-generate failed", e);
            AiBatchGenerateResponse error = AiBatchGenerateResponse.builder()
                    .moduleType(request.getModuleType())
                    .items(java.util.List.of())
                    .message("เกิดข้อผิดพลาด: " + e.getMessage())
                    .build();
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
