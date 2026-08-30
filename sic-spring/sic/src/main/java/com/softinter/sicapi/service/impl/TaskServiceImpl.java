package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.TaskRequest;
import com.softinter.sicapi.dto.response.TaskResponse;
import com.softinter.sicapi.entity.enums.TraceRelationship;
import com.softinter.sicapi.entity.pm.PmMilestone;
import com.softinter.sicapi.entity.pm.PmPhase;
import com.softinter.sicapi.entity.pm.PmTask;
import com.softinter.sicapi.entity.pm.PmTaskAssignee;
import com.softinter.sicapi.entity.pm.PmWorkPackage;
import com.softinter.sicapi.entity.su.SuProfile;
import com.softinter.sicapi.entity.pm.PmSpecification;
import com.softinter.sicapi.repository.pm.PmSpecificationRepository;
import com.softinter.sicapi.repository.pm.PmPhaseRepository;
import com.softinter.sicapi.repository.pm.PmTaskAssigneeRepository;
import com.softinter.sicapi.repository.pm.PmTaskRepository;
import com.softinter.sicapi.repository.pm.PmWorkPackageRepository;
import com.softinter.sicapi.repository.su.SuProfileRepository;
import com.softinter.sicapi.repository.su.SuUserBusinessRepository;
import com.softinter.sicapi.service.TaskService;
import com.softinter.sicapi.service.TraceLinkService;
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
    private final PmSpecificationRepository specificationRepository;
    private final PmPhaseRepository phaseRepository;
    private final PmTaskAssigneeRepository taskAssigneeRepository;
    private final SuUserBusinessRepository userBusinessRepository;
    private final SuProfileRepository profileRepository;
    private final TraceLinkService traceLinkService;

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
        task.setStatus(request.getStatus() != null ? request.getStatus() : "Todo");
        task.setColor(request.getColor());

        if (request.getSpecificationId() != null) {
            specificationRepository.findById(request.getSpecificationId())
                    .ifPresent(task::setSpecification);
        }

        task = taskRepository.save(task);

        // บันทึกผู้รับผิดชอบร่วม
        saveAssignees(task, request.getAssigneeIds());

        // ===== สร้าง Trace Link =====
        UUID projectId = wp.getMilestone().getPhase().getProject().getId();
        if (request.getSpecificationId() != null) {
            traceLinkService.createLink(
                projectId,
                "SPECIFICATION", request.getSpecificationId(),
                "TASK", task.getId(),
                TraceRelationship.IMPLEMENTED_BY
            );
        }

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

        if (request.getSpecificationId() != null) {
            specificationRepository.findById(request.getSpecificationId())
                    .ifPresent(task::setSpecification);
        }

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            task.setStatus(request.getStatus());
            if (isCompletedStatus(request.getStatus())) {
                if (task.getActualEnd() == null) {
                    task.setActualEnd(Instant.now());
                }
            } else if ("In Progress".equalsIgnoreCase(request.getStatus()) || "Doing".equalsIgnoreCase(request.getStatus())) {
                if (task.getActualStart() == null) {
                    task.setActualStart(Instant.now());
                }
            }
        }

        task = taskRepository.save(task);

        // ✅ อัปเดตผู้รับผิดชอบร่วม: ลบเก่า แล้วเพิ่มใหม่
        taskAssigneeRepository.deleteByTaskId(taskId);
        saveAssignees(task, request.getAssigneeIds());

        if (request.getSpecificationId() != null && task.getWorkPackage() != null) {
            UUID projectId = task.getWorkPackage().getMilestone().getPhase().getProject().getId();
            traceLinkService.createLink(
                projectId,
                "SPECIFICATION", request.getSpecificationId(),
                "TASK", task.getId(),
                TraceRelationship.IMPLEMENTED_BY
            );
        }

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
            taskAssigneeRepository.save(assignee);
        }
    }

    private boolean isBugTask(PmTask task) {
        if (task == null) return false;
        String code = task.getTaskCode() != null ? task.getTaskCode().trim().toUpperCase() : "";
        String name = task.getTaskName() != null ? task.getTaskName().trim().toUpperCase() : "";
        return code.startsWith("BUG") || code.startsWith("BG-") || name.startsWith("[BUG]");
    }

    private boolean isCompletedStatus(String status) {
        if (status == null) return false;
        String s = status.trim();
        return "Done".equalsIgnoreCase(s) || "Complete".equalsIgnoreCase(s) || "Completed".equalsIgnoreCase(s);
    }

    // ===== PRIVATE: อัปเดตความคืบหน้าของ Phase (นับเฉพาะ Task ปกติ ไม่รวม Bug Task) =====
    private void updatePhaseProgress(PmPhase phase) {
        if (phase == null) return;
        int total = 0, done = 0;
        if (phase.getMilestones() != null) {
            for (PmMilestone ms : phase.getMilestones()) {
                if (ms.getIsDelete() != null && ms.getIsDelete()) continue;
                if (ms.getWorkPackages() != null) {
                    for (PmWorkPackage wp : ms.getWorkPackages()) {
                        if (wp.getIsDelete() != null && wp.getIsDelete()) continue;
                        if (wp.getTasks() != null) {
                            for (PmTask task : wp.getTasks()) {
                                if (task.getIsDelete() == null || !task.getIsDelete()) {
                                    if (!isBugTask(task)) {
                                        total++;
                                        if (isCompletedStatus(task.getStatus())) done++;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        int progress = total == 0 ? 0 : (done * 100 / total);
        phase.setProgress(progress);
        phaseRepository.save(phase);
    }

    // ===== PRIVATE: Entity → Response =====
    private TaskResponse toResponse(PmTask task) {
        TaskResponse dto = new TaskResponse();
        dto.setId(task.getId());
        if (task.getWorkPackage() != null) {
            dto.setWorkPackageId(task.getWorkPackage().getId());
            dto.setWorkPackageName(task.getWorkPackage().getPackageName());
        }
        if (task.getSpecification() != null) {
            dto.setSpecificationId(task.getSpecification().getId());
            dto.setSpecificationCode(task.getSpecification().getSpecificationCode());
            dto.setSpecificationTitle(task.getSpecification().getTitle());
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
        updatePhaseProgress(task.getWorkPackage().getMilestone().getPhase());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> getAllTasksByProjectId(UUID projectId) {
        return taskRepository.findByWorkPackageMilestonePhaseProjectIdAndIsDeleteFalse(projectId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }
}