package com.softinter.sicapi.controller.pm;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.softinter.sicapi.dto.request.TaskRequest;
import com.softinter.sicapi.dto.response.ComboboxResponse;
import com.softinter.sicapi.dto.response.PaginationResponse;
import com.softinter.sicapi.dto.response.TaskResponse;
import com.softinter.sicapi.service.TaskService;
import com.softinter.sicapi.util.PaginationUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/api/pm/tasks")
@RequiredArgsConstructor
@Slf4j
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/work-package/{wpId}")
    public ResponseEntity<List<TaskResponse>> getTasksByWorkPackageId(@PathVariable UUID wpId) {
        log.info("Getting all tasks for work package ID: {}", wpId);
        List<TaskResponse> tasks = taskService.getTasksByWorkPackageId(wpId);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable UUID taskId) {
        log.info("Getting task by ID: {}", taskId);
        TaskResponse task = taskService.getTaskById(taskId);
        return ResponseEntity.ok(task);
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@RequestBody TaskRequest request) {
        log.info("Creating new task for work package ID: {}", request.getWorkPackageId());
        TaskResponse created = taskService.createTask(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable UUID taskId,
            @RequestBody TaskRequest request) {
        log.info("Updating task ID: {}", taskId);
        TaskResponse updated = taskService.updateTask(taskId, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID taskId) {
        log.info("Deleting task ID: {}", taskId);
        taskService.deleteTask(taskId);
        return ResponseEntity.noContent().build();
    }

    /** Task ทั้งหมดของ business (ใช้กับหน้า Task Board เมื่อยังไม่ได้ระบุโครงการใน URL) */
    @GetMapping("/business")
    public ResponseEntity<List<TaskResponse>> getBusinessTasks() {
        UUID businessId = com.softinter.sicapi.config.BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(taskService.getAllTasksByBusinessId(businessId, null));
    }

    @GetMapping("/search")
    public ResponseEntity<PaginationResponse<TaskResponse>> search(
            @RequestParam UUID projectId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PaginationUtil.toPageable(page, size);
        Page<TaskResponse> pageResult = taskService.search(projectId, keyword, pageable);
        return ResponseEntity.ok(PaginationUtil.of(pageResult));
    }

    @GetMapping("/combobox")
    public ResponseEntity<List<ComboboxResponse>> getComboboxTasks(
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) String keyword) {
        List<TaskResponse> tasks;
        if (projectId != null) {
            log.info("Getting tasks combobox for project ID: {}", projectId);
            tasks = taskService.getAllTasksByProjectId(projectId);
        } else {
            UUID businessId = com.softinter.sicapi.config.BusinessContextHolder.getBusinessId();
            if (businessId == null) {
                return ResponseEntity.badRequest().build();
            }
            log.info("Getting tasks combobox for business ID: {} (ไม่มี projectId มาก่อน)", businessId);
            tasks = taskService.getAllTasksByBusinessId(businessId, keyword);
        }
        List<ComboboxResponse> list = tasks.stream()
                .map(t -> new ComboboxResponse(t.getId().toString(), t.getTaskCode() + " - " + t.getTaskName()))
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(list);
    }
}