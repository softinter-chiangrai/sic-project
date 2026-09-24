package com.softinter.sicapi.controller.pm;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.softinter.sicapi.dto.request.AiPhaseWbsRequest;
import com.softinter.sicapi.dto.response.AiPhaseWbsResponse;
import com.softinter.sicapi.service.impl.AiPhaseWbsService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pm/ai/phase-wbs")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "AI Phase WBS", description = "สร้าง Milestone / Work Package / Task ใต้ Phase ด้วย AI ในครั้งเดียว")
public class AiPhaseWbsController {

    private final AiPhaseWbsService service;

    @PostMapping("/generate")
    @Operation(summary = "AI สร้าง Milestone, Work Package และ Task ให้ Phase (เพิ่มอย่างเดียว ไม่แก้ของเดิม)")
    public ResponseEntity<AiPhaseWbsResponse> generate(@RequestBody AiPhaseWbsRequest request) {
        return ResponseEntity.ok(service.generate(request));
    }
}
