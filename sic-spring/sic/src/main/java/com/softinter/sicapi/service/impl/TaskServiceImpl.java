package com.softinter.sicapi.service.impl;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.dto.request.TaskRequest;
import com.softinter.sicapi.dto.response.TaskResponse;
import com.softinter.sicapi.entity.pm.PmMilestone;
import com.softinter.sicapi.entity.pm.PmPhase;
import com.softinter.sicapi.entity.pm.PmTask;
import com.softinter.sicapi.entity.pm.PmWorkPackage;
import com.softinter.sicapi.repository.pm.PmPhaseRepository;
import com.softinter.sicapi.repository.pm.PmTaskRepository;
import com.softinter.sicapi.repository.pm.PmWorkPackageRepository;
import com.softinter.sicapi.service.TaskService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskServiceImpl implements TaskService {

    private final PmTaskRepository taskRepository;
    private final PmWorkPackageRepository wpRepository;
    private final PmPhaseRepository phaseRepository;  // ✅ เพิ่ม

    @Override
    public List<TaskResponse> getTasksByWorkPackageId(UUID wpId) {
        return taskRepository.findByWorkPackageIdAndIsDeleteFalse(wpId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public TaskResponse getTaskById(UUID taskId) {
        PmTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        return toResponse(task);
    }

    @Override
    @Transactional
    public TaskResponse createTask(TaskRequest request) {
        PmWorkPackage wp = wpRepository.findById(request.getWorkPackageId())
                .orElseThrow(() -> new RuntimeException("Work Package not found"));

        PmTask task = new PmTask();
        task.setWorkPackage(wp);
        task.setTaskCode(request.getTaskCode());
        task.setTaskName(request.getTaskName());
        task.setDescription(request.getDescription());
        task.setAssignedTo(request.getAssignedTo());
        task.setStartDate(request.getStartDate());
        task.setEndDate(request.getEndDate());
        task.setEstimateManday(request.getEstimateManday());
        task.setPriority(request.getPriority());
        task.setStatus("Todo");

        task = taskRepository.save(task);
        updatePhaseProgress(task.getWorkPackage().getMilestone().getPhase());
        return toResponse(task);
    }

    @Override
    @Transactional
    public TaskResponse updateTask(UUID taskId, TaskRequest request) {
        PmTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setTaskCode(request.getTaskCode());
        task.setTaskName(request.getTaskName());
        task.setDescription(request.getDescription());
        task.setAssignedTo(request.getAssignedTo());
        task.setStartDate(request.getStartDate());
        task.setEndDate(request.getEndDate());
        task.setEstimateManday(request.getEstimateManday());
        task.setPriority(request.getPriority());

        task = taskRepository.save(task);
        updatePhaseProgress(task.getWorkPackage().getMilestone().getPhase());
        return toResponse(task);
    }

    @Override
    @Transactional
    public void deleteTask(UUID taskId) {
        PmTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setIsDelete(true);
        task.setDeleteDate(Instant.now());
        taskRepository.save(task);
        // อัปเดต progress ของ phase
        updatePhaseProgress(task.getWorkPackage().getMilestone().getPhase());
    }

    @Override
    public List<TaskResponse> getAllTasksByProjectId(UUID projectId) {
        // ต้องมี method ใน Repository: findByProjectIdAndIsDeleteFalse
        // หรือใช้ Native Query
        return List.of(); // placeholder
    }

    // ========== PRIVATE ==========

    private void updatePhaseProgress(PmPhase phase) {
        int total = 0, done = 0;
        for (PmMilestone ms : phase.getMilestones()) {
            for (PmWorkPackage wp : ms.getWorkPackages()) {
                for (PmTask task : wp.getTasks()) {
                    if (!task.getIsDelete()) {  // ✅ ใช้ getIsDelete()
                        total++;
                        if ("Done".equals(task.getStatus())) done++;
                    }
                }
            }
        }
        int progress = total == 0 ? 0 : (done * 100 / total);
        phase.setProgress(progress);
        phaseRepository.save(phase);  // ✅ บันทึก phase
    }

    private TaskResponse toResponse(PmTask task) {
        TaskResponse dto = new TaskResponse();
        dto.setId(task.getId());
        if (task.getWorkPackage() != null) {
            dto.setWorkPackageId(task.getWorkPackage().getId());
            dto.setWorkPackageName(task.getWorkPackage().getPackageName());
        }
        dto.setTaskCode(task.getTaskCode());
        dto.setTaskName(task.getTaskName());
        dto.setDescription(task.getDescription());
        dto.setAssignedTo(task.getAssignedTo());
        dto.setStartDate(task.getStartDate());
        dto.setEndDate(task.getEndDate());
        dto.setActualStart(task.getActualStart());
        dto.setActualEnd(task.getActualEnd());
        dto.setEstimateManday(task.getEstimateManday());
        dto.setActualManday(task.getActualManday());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        return dto;
    }
}