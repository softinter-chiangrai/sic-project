package com.softinter.sicapi.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.softinter.sicapi.dto.request.SaveAiModelConfigRequest;
import com.softinter.sicapi.dto.response.AiModelConfigResponse;
import com.softinter.sicapi.service.AiModelConfigService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * หน้าจัดการ AI Model (BURT07) — CRUD ตาราง db_ai_model_config ที่ PmAiProviderServiceImpl
 * ใช้เป็นแหล่งข้อมูล model/provider/apiUrl/apiKey แทนการ hardcode ใน application.yml
 * response ที่คืนออกไปไม่มี field ไหนส่ง api key เต็มกลับไปเลย (ดู AiModelConfigResponse)
 */
@RestController
@RequestMapping("/api/ai-model-config")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "AI Model Config", description = "Manage AI model providers/keys used across the system")
public class AiModelConfigController {

    private final AiModelConfigService service;

    @GetMapping
    @Operation(summary = "List all AI model configs (admin)")
    public ResponseEntity<List<AiModelConfigResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get one AI model config by id")
    public ResponseEntity<AiModelConfigResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    @Operation(summary = "Create or update an AI model config")
    public ResponseEntity<AiModelConfigResponse> save(@RequestBody SaveAiModelConfigRequest request) {
        return ResponseEntity.ok(service.save(request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete an AI model config")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
