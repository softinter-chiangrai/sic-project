package com.softinter.sicapi.service;


import java.util.List;
import java.util.UUID;

import com.softinter.sicapi.dto.request.TaskRequest;
import com.softinter.sicapi.dto.response.TaskResponse;

public interface TaskService {
    List<TaskResponse> getTasksByWorkPackageId(UUID wpId);
    TaskResponse getTaskById(UUID taskId);
    TaskResponse createTask(TaskRequest request);
    TaskResponse updateTask(UUID taskId, TaskRequest request);
    void deleteTask(UUID taskId);
    List<TaskResponse> getAllTasksByProjectId(UUID projectId);
}