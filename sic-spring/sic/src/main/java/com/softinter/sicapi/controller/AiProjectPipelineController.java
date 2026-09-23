package com.softinter.sicapi.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.softinter.sicapi.dto.request.AiProjectPipelineRequest;
import com.softinter.sicapi.dto.response.AiProjectPipelineExecuteResponse;
import com.softinter.sicapi.dto.response.AiProjectPipelinePreviewResponse;
import com.softinter.sicapi.service.AiProjectPipelineService;
import com.softinter.sicapi.service.CurrentUserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/pm/ai/pipeline")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "AI Project Pipeline", description = "สร้างและประมวลผลทั้งโครงการแบบ End-to-End ด้วย AI Pipeline")
public class AiProjectPipelineController {

    private final AiProjectPipelineService pipelineService;
    private final CurrentUserService currentUserService;

    @PostMapping("/preview")
    @Operation(summary = "วิเคราะห์และแตกโครงสร้างโครงการตัวอย่าง (Preview Plan) ก่อนเริ่มสร้างจริง")
    public ResponseEntity<AiProjectPipelinePreviewResponse> generatePreview(@RequestBody AiProjectPipelineRequest request) {
        UUID businessId = currentUserService.getBusinessId();
        return ResponseEntity.ok(pipelineService.generatePreview(request, businessId));
    }

    @PostMapping("/execute")
    @Operation(summary = "ประมวลผลสร้างโครงการและโมดูลทั้งหมด (Project, Req, Spec, Task, Gantt, Delivery) ลงฐานข้อมูล")
    public ResponseEntity<AiProjectPipelineExecuteResponse> executePipeline(@RequestBody AiProjectPipelineRequest request) {
        UUID businessId = currentUserService.getBusinessId();
        String userId = currentUserService.getUserId();
        return ResponseEntity.ok(pipelineService.executePipeline(request, businessId, userId));
    }
}
