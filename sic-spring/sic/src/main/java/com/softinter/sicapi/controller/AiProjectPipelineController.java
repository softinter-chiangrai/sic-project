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
import com.softinter.sicapi.service.impl.AiProjectPipelineJobService;
import com.softinter.sicapi.dto.response.AiPipelineJobResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
    private final AiProjectPipelineJobService jobService;

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

    @PostMapping("/execute-async")
    @Operation(summary = "เริ่มสร้างโครงการครบทุก module แบบทำงานเบื้องหลัง (คืน jobId ให้ poll ความคืบหน้า)")
    public ResponseEntity<java.util.Map<String, UUID>> executeAsync(@RequestBody AiProjectPipelineRequest request) {
        UUID businessId = currentUserService.getBusinessId();
        String userId = currentUserService.getUserId();
        return ResponseEntity.ok(java.util.Map.of("jobId", jobService.start(request, businessId, userId)));
    }

    @GetMapping("/jobs/{jobId}")
    @Operation(summary = "ดูความคืบหน้าของงานสร้างโครงการเบื้องหลัง")
    public ResponseEntity<AiPipelineJobResponse> getJob(@PathVariable UUID jobId) {
        AiPipelineJobResponse job = jobService.get(jobId);
        return job == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(job);
    }
}
