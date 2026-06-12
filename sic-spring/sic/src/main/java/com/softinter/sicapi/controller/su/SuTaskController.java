package com.softinter.sicapi.controller.su;

import com.softinter.sicapi.dto.response.*;
import com.softinter.sicapi.entity.su.SuTask;
import com.softinter.sicapi.repository.su.SuTaskRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/su/tasks")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Task", description = "Task Management API")
public class SuTaskController {

    private final SuTaskRepository taskRepository;

    @GetMapping("/lov")
    @Operation(summary = "Get task LOV")
    public ResponseEntity<ApiResponse<List<LovResponse>>> getLov() {
        List<LovResponse> lov = taskRepository.findByIsActiveTrue()
                .stream()
                .map(t -> new LovResponse(t.getId(), t.getTaskNameEn()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(lov));
    }

    // ✅ เพิ่ม method นี้
    @GetMapping("/search")
    @Operation(summary = "Search tasks")
    public ResponseEntity<ApiResponse<List<SuTask>>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UUID taskId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        // TODO: implement search logic based on parameters
        List<SuTask> tasks = taskRepository.findByIsActiveTrue();
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }
}