package com.softinter.sicapi.controller.pm;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.softinter.sicapi.dto.response.TaskResponse;
import com.softinter.sicapi.service.TaskService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/pm/projects")
@RequiredArgsConstructor
@Slf4j
public class ProjectTaskController {

    private final TaskService taskService;

    @GetMapping("/{projectId}/tasks")
    public ResponseEntity<List<TaskResponse>> getAllTasksByProjectId(@PathVariable UUID projectId) {
        log.info("Getting all tasks for project ID: {}", projectId);
        List<TaskResponse> tasks = taskService.getAllTasksByProjectId(projectId);
        return ResponseEntity.ok(tasks);
    }
}