package com.softinter.sicapi.service.impl;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.request.PhaseRequest;
import com.softinter.sicapi.dto.response.MilestoneResponse;
import com.softinter.sicapi.dto.response.PhaseResponse;
import com.softinter.sicapi.dto.response.TaskResponse;
import com.softinter.sicapi.dto.response.WorkPackageResponse;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.entity.pm.PmMilestone;
import com.softinter.sicapi.entity.pm.PmPhase;
import com.softinter.sicapi.entity.pm.PmTask;
import com.softinter.sicapi.entity.pm.PmTaskAssignee;
import com.softinter.sicapi.entity.pm.PmWorkPackage;
import com.softinter.sicapi.entity.su.SuProfile;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmMilestoneRepository;
import com.softinter.sicapi.repository.pm.PmPhaseRepository;
import com.softinter.sicapi.repository.pm.PmTaskAssigneeRepository;
import com.softinter.sicapi.repository.pm.PmTaskRepository;
import com.softinter.sicapi.repository.su.SuProfileRepository;
import com.softinter.sicapi.service.PhaseService;
import com.softinter.sicapi.service.AuditLogService;
import com.softinter.sicapi.util.LocalizationHelper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PhaseServiceImpl implements PhaseService {

    private final PmPhaseRepository phaseRepository;
    private final PmMilestoneRepository milestoneRepository;
    private final PmTaskRepository taskRepository;
    private final PmCustomerProjectRepository projectRepository;
    private final PmTaskAssigneeRepository taskAssigneeRepository;
    private final SuProfileRepository profileRepository;
    private final AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public List<PhaseResponse> getPhasesByProjectId(UUID projectId) {
        return phaseRepository.findByProjectIdAndIsDeleteFalseOrderByStartDateAsc(projectId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PhaseResponse getPhaseById(UUID phaseId) {
        PmPhase phase = phaseRepository.findById(phaseId)
                .orElseThrow(() -> new RuntimeException("Phase not found"));
        return toResponse(phase);
    }

    @Override
    @Transactional
    public PhaseResponse createPhase(PhaseRequest request) {
        PmCustomerProject project = getProject(request.getProjectId());

        PmPhase phase = new PmPhase();
        phase.setProject(project);

        String phaseCode = request.getPhaseCode();
        if (phaseCode == null || phaseCode.trim().isEmpty()) {
            long count = phaseRepository.countByProjectId(request.getProjectId());
            phaseCode = String.format("PH-%03d", count + 1);
        }
        phase.setPhaseCode(phaseCode);

        phase.setPhaseName(request.getPhaseName());
        phase.setDescription(request.getDescription());
        phase.setStartDate(request.getStartDate());
        phase.setEndDate(request.getEndDate());
        phase.setOwner(request.getOwner());
        phase.setColor(request.getColor());
        phase.setStatus("Not Started");
        phase.setProgress(0);

        if (request.getDependencyId() != null) {
            PmPhase dep = phaseRepository.findById(request.getDependencyId())
                    .orElseThrow(() -> new RuntimeException("Dependency Phase not found"));
            phase.setDependency(dep);
        }

        phase = phaseRepository.save(phase);

        try {
            auditLogService.log("CREATE_PHASE", "Project Management / Phase",
                    "สร้าง Phase: " + phase.getPhaseName() + " (" + phase.getPhaseCode() + ")",
                    "PHASE", phase.getId(), null, null, "Success", null);
        } catch (Exception e) {
            log.error("ผิดพลาด audit log CREATE_PHASE: {}", e.getMessage(), e);
        }

        return toResponse(phase);
    }

    @Override
    @Transactional
    public PhaseResponse updatePhase(UUID phaseId, PhaseRequest request) {
        PmPhase phase = phaseRepository.findById(phaseId)
                .orElseThrow(() -> new RuntimeException("Phase not found"));

        if (request.getPhaseCode() != null && !request.getPhaseCode().trim().isEmpty()) {
            phase.setPhaseCode(request.getPhaseCode().trim());
        }
        phase.setPhaseName(request.getPhaseName());
        phase.setDescription(request.getDescription());
        phase.setStartDate(request.getStartDate());
        phase.setEndDate(request.getEndDate());
        phase.setOwner(request.getOwner());
        phase.setColor(request.getColor());

        if (request.getDependencyId() != null) {
            PmPhase dep = phaseRepository.findById(request.getDependencyId())
                    .orElseThrow(() -> new RuntimeException("Dependency Phase not found"));
            phase.setDependency(dep);
        }

        phase = phaseRepository.save(phase);
        updatePhaseProgress(phase);

        try {
            auditLogService.log("UPDATE_PHASE", "Project Management / Phase",
                    "แก้ไข Phase: " + phase.getPhaseName() + " (" + phase.getPhaseCode() + ")",
                    "PHASE", phase.getId(), null, null, "Success", null);
        } catch (Exception e) {
            log.error("ผิดพลาด audit log UPDATE_PHASE: {}", e.getMessage(), e);
        }

        return toResponse(phase);
    }

    @Override
    @Transactional
    public void deletePhase(UUID phaseId) {
        PmPhase phase = phaseRepository.findById(phaseId)
                .orElseThrow(() -> new RuntimeException("Phase not found"));
        phase.setIsDelete(true);
        phase.setDeleteDate(Instant.now());
        phaseRepository.save(phase);

        try {
            auditLogService.log("DELETE_PHASE", "Project Management / Phase",
                    "ลบ Phase: " + phase.getPhaseName() + " (" + phase.getPhaseCode() + ")",
                    "PHASE", phase.getId(), null, null, "Success", null);
        } catch (Exception e) {
            log.error("ผิดพลาด audit log DELETE_PHASE: {}", e.getMessage(), e);
        }
    }

    // ===== PRIVATE =====
    private PhaseResponse toResponse(PmPhase phase) {
        PhaseResponse dto = new PhaseResponse();
        dto.setId(phase.getId());
        dto.setProjectId(phase.getProject().getId());
        dto.setProjectName(phase.getProject().getProjectName());
        dto.setPhaseCode(phase.getPhaseCode());
        dto.setPhaseName(phase.getPhaseName());
        dto.setDescription(phase.getDescription());
        dto.setStartDate(phase.getStartDate());
        dto.setEndDate(phase.getEndDate());
        dto.setOwner(phase.getOwner());
        dto.setStatus(phase.getStatus());
        dto.setProgress(phase.getProgress());
        dto.setColor(phase.getColor());
        if (phase.getDependency() != null) {
            dto.setDependencyId(phase.getDependency().getId());
            dto.setDependencyName(phase.getDependency().getPhaseName());
        }

        // คำนวณสถิติและ map milestones (นับเฉพาะ Task ปกติ ไม่รวม Bug Task)
        int total = 0, completed = 0;
        List<MilestoneResponse> milestoneResponses = new java.util.ArrayList<>();
        if (phase.getMilestones() != null) {
            for (PmMilestone ms : phase.getMilestones()) {
                if (ms.getIsDelete() != null && ms.getIsDelete()) continue;
                
                MilestoneResponse msDto = toMilestoneResponse(ms);
                milestoneResponses.add(msDto);
                
                if (ms.getWorkPackages() != null) {
                    for (PmWorkPackage wp : ms.getWorkPackages()) {
                        if (wp.getIsDelete() != null && wp.getIsDelete()) continue;
                        
                        if (wp.getTasks() != null) {
                            for (PmTask task : wp.getTasks()) {
                                if (task.getIsDelete() == null || !task.getIsDelete()) {
                                    if (!isBugTask(task)) {
                                        total++;
                                        if (isCompletedStatus(task.getStatus())) completed++;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        dto.setMilestones(milestoneResponses);
        dto.setTaskCount(total);
        dto.setTaskCompletedCount(completed);
        dto.setMilestoneCount(milestoneResponses.size());
        int progress = total == 0 ? 0 : (completed * 100 / total);
        dto.setProgress(progress);
        
        // คำนวณ dynamic status ตาม progress และวันที่
        String computedStatus = calculatePhaseStatus(progress, total, phase.getStartDate(), phase.getEndDate());
        dto.setStatus(computedStatus);
        
        return dto;
    }

    private MilestoneResponse toMilestoneResponse(PmMilestone ms) {
        MilestoneResponse dto = new MilestoneResponse();
        dto.setId(ms.getId());
        dto.setPhaseId(ms.getPhase().getId());
        dto.setPhaseName(ms.getPhase().getPhaseName());
        dto.setMilestoneName(ms.getMilestoneName());
        dto.setDescription(ms.getDescription());
        dto.setDueDate(ms.getDueDate());
        dto.setStatus(ms.getStatus());
        
        List<WorkPackageResponse> wpResponses = new java.util.ArrayList<>();
        if (ms.getWorkPackages() != null) {
            for (PmWorkPackage wp : ms.getWorkPackages()) {
                if (wp.getIsDelete() == null || !wp.getIsDelete()) {
                    wpResponses.add(toWorkPackageResponse(wp));
                }
            }
        }
        dto.setWorkPackages(wpResponses);
        return dto;
    }

    private WorkPackageResponse toWorkPackageResponse(PmWorkPackage wp) {
        WorkPackageResponse dto = new WorkPackageResponse();
        dto.setId(wp.getId());
        dto.setMilestoneId(wp.getMilestone().getId());
        dto.setMilestoneName(wp.getMilestone().getMilestoneName());
        dto.setPackageName(wp.getPackageName());
        dto.setDescription(wp.getDescription());
        dto.setStartDate(wp.getStartDate());
        dto.setEndDate(wp.getEndDate());
        dto.setStatus(wp.getStatus());
        
        List<TaskResponse> taskResponses = new java.util.ArrayList<>();
        if (wp.getTasks() != null) {
            for (PmTask task : wp.getTasks()) {
                if (task.getIsDelete() == null || !task.getIsDelete()) {
                    taskResponses.add(toTaskResponse(task));
                }
            }
        }
        dto.setTasks(taskResponses);
        return dto;
    }

    private TaskResponse toTaskResponse(PmTask task) {
        TaskResponse dto = new TaskResponse();
        dto.setId(task.getId());
        dto.setWorkPackageId(task.getWorkPackage().getId());
        dto.setWorkPackageName(task.getWorkPackage().getPackageName());
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

        List<PmTaskAssignee> assignees = taskAssigneeRepository.findByTaskId(task.getId());
        if (assignees != null && !assignees.isEmpty()) {
            List<String> userIds = assignees.stream()
                    .map(PmTaskAssignee::getUserId)
                    .collect(Collectors.toList());
            dto.setAssigneeIds(userIds);

            Map<String, String> names = new HashMap<>();
            List<SuProfile> profiles = profileRepository.findByUserIdIn(userIds);
            for (SuProfile profile : profiles) {
                String fullName = LocalizationHelper.getFullName(profile);
                names.put(profile.getUserId(), fullName != null ? fullName : profile.getUserId());
            }
            for (String userId : userIds) {
                names.putIfAbsent(userId, userId);
            }
            dto.setAssigneeNames(names);
        }

        return dto;
    }

    private PmCustomerProject getProject(UUID projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
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

        // คำนวณ status ตาม progress และวันที่
        String status = calculatePhaseStatus(progress, total, phase.getStartDate(), phase.getEndDate());
        phase.setStatus(status);

        phaseRepository.save(phase);
    }

    private String calculatePhaseStatus(int progress, int totalTasks, java.time.Instant startDate, java.time.Instant endDate) {
        if (progress >= 100 && totalTasks > 0) {
            return "Done";
        }
        java.time.Instant now = java.time.Instant.now();
        if (endDate != null && now.isAfter(endDate) && progress < 100) {
            return "Delayed";
        }
        if (progress > 0) {
            return "In Progress";
        }
        if (startDate != null && now.isAfter(startDate)) {
            return "In Progress";
        }
        return "Not Started";
    }
}