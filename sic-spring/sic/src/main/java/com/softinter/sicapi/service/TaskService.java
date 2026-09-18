package com.softinter.sicapi.service;


import java.util.List;
import java.util.UUID;

import com.softinter.sicapi.dto.request.TaskRequest;
import com.softinter.sicapi.dto.response.TaskResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TaskService {
    List<TaskResponse> getTasksByWorkPackageId(UUID wpId);
    TaskResponse getTaskById(UUID taskId);
    TaskResponse createTask(TaskRequest request);
    TaskResponse updateTask(UUID taskId, TaskRequest request);
    void deleteTask(UUID taskId);
    List<TaskResponse> getAllTasksByProjectId(UUID projectId);
    List<TaskResponse> getAllTasksByBusinessId(UUID businessId, String keyword);
    Page<TaskResponse> search(UUID projectId, String keyword, Pageable pageable);
}