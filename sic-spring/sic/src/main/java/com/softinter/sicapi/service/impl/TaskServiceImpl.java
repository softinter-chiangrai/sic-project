// src/main/java/com/softinter/sicapi/service/impl/TaskServiceImpl.java

package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.TaskRequest;
import com.softinter.sicapi.dto.response.TaskResponse;
import com.softinter.sicapi.entity.pm.PmMilestone;
import com.softinter.sicapi.entity.pm.PmPhase;
import com.softinter.sicapi.entity.pm.PmTask;
import com.softinter.sicapi.entity.pm.PmTaskAssignee;
import com.softinter.sicapi.entity.pm.PmWorkPackage;
import com.softinter.sicapi.entity.su.SuProfile;
import com.softinter.sicapi.repository.pm.PmPhaseRepository;
import com.softinter.sicapi.repository.pm.PmTaskAssigneeRepository;
import com.softinter.sicapi.repository.pm.PmTaskRepository;
import com.softinter.sicapi.repository.pm.PmWorkPackageRepository;
import com.softinter.sicapi.repository.su.SuProfileRepository;
import com.softinter.sicapi.repository.su.SuUserBusinessRepository;
import com.softinter.sicapi.service.TaskService;
import com.softinter.sicapi.util.LocalizationHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskServiceImpl implements TaskService {

    private final PmTaskRepository taskRepository;
    private final PmWorkPackageRepository wpRepository;
    private final PmPhaseRepository phaseRepository;
    private final PmTaskAssigneeRepository taskAssigneeRepository;
    private final SuUserBusinessRepository userBusinessRepository;
    private final SuProfileRepository profileRepository;

    // ===== CREATE =====
    @Override
    @Transactional
    public TaskResponse createTask(TaskRequest request) {
        PmWorkPackage wp = wpRepository.findById(request.getWorkPackageId())
                .orElseThrow(() -> new RuntimeException("Work Package not found"));

        PmTask task = new PmTask();
        task.setWorkPackage(wp);
        task.setBusinessId(wp.getBusinessId());
        task.setTaskCode(request.getTaskCode());
        task.setTaskName(request.getTaskName());
        task.setDescription(request.getDescription());
        task.setAssignedTo(request.getAssignedTo());
        task.setStartDate(request.getStartDate());
        task.setEndDate(request.getEndDate());
        task.setEstimateManday(request.getEstimateManday());
        task.setPriority(request.getPriority());
        task.setStatus("Todo");
        task.setColor(request.getColor());

        task = taskRepository.save(task);

        // ✅ บันทึกผู้รับผิดชอบร่วม (assignees)
        saveAssignees(task, request.getAssigneeIds());

        updatePhaseProgress(task.getWorkPackage().getMilestone().getPhase());
        return toResponse(task);
    }

    // ===== UPDATE =====
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
        task.setColor(request.getColor());

        task = taskRepository.save(task);

        // ✅ อัปเดตผู้รับผิดชอบร่วม: ลบเก่า แล้วเพิ่มใหม่
        taskAssigneeRepository.deleteByTaskId(taskId);
        saveAssignees(task, request.getAssigneeIds());

        updatePhaseProgress(task.getWorkPackage().getMilestone().getPhase());
        return toResponse(task);
    }

    // ===== PRIVATE: บันทึก assignees =====
    private void saveAssignees(PmTask task, List<String> assigneeIds) {
        if (assigneeIds == null || assigneeIds.isEmpty()) {
            return;
        }

        for (String userId : assigneeIds) {
            PmTaskAssignee assignee = new PmTaskAssignee();
            assignee.setTask(task);
            assignee.setUserId(userId);
            // role_in_task ปล่อย null หรือกำหนดค่า default
            taskAssigneeRepository.save(assignee);
        }
    }

    // ===== PRIVATE: Entity → Response =====
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
        dto.setColor(task.getColor());

        // ✅ ดึงผู้รับผิดชอบร่วม (assignees)
        List<PmTaskAssignee> assignees = taskAssigneeRepository.findByTaskId(task.getId());
        if (assignees != null && !assignees.isEmpty()) {
            List<String> userIds = assignees.stream()
                    .map(PmTaskAssignee::getUserId)
                    .collect(Collectors.toList());
            dto.setAssigneeIds(userIds);

            // ✅ ดึงชื่อผู้ใช้จาก SuProfile
            Map<String, String> names = new HashMap<>();
            List<SuProfile> profiles = profileRepository.findByUserIdIn(userIds);
            for (SuProfile profile : profiles) {
                String fullName = LocalizationHelper.getFullName(profile);
                names.put(profile.getUserId(), fullName != null ? fullName : profile.getUserId());
            }
            // กรณีหาชื่อไม่เจอ ให้ใช้ userId เป็นชื่อ
            for (String userId : userIds) {
                names.putIfAbsent(userId, userId);
            }
            dto.setAssigneeNames(names);
        }

        return dto;
    }

    // ===== PRIVATE: อัปเดตความคืบหน้าของ Phase =====
    private void updatePhaseProgress(PmPhase phase) {
        int total = 0, done = 0;
        for (PmMilestone ms : phase.getMilestones()) {
            for (PmWorkPackage wp : ms.getWorkPackages()) {
                for (PmTask task : wp.getTasks()) {
                    if (!task.getIsDelete()) {
                        total++;
                        if ("Done".equals(task.getStatus())) done++;
                    }
                }
            }
        }
        int progress = total == 0 ? 0 : (done * 100 / total);
        phase.setProgress(progress);
        phaseRepository.save(phase);
    }

    // ===== METHOD อื่น ๆ (GET, DELETE) =====
    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksByWorkPackageId(UUID wpId) {
        return taskRepository.findByWorkPackageIdAndIsDeleteFalse(wpId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TaskResponse getTaskById(UUID taskId) {
        PmTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
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
        // TODO: implement if needed
        return List.of();
    }
}