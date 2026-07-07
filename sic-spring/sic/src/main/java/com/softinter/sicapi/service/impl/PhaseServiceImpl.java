package com.softinter.sicapi.service.impl;

import java.time.Instant;
import java.util.List;
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
import com.softinter.sicapi.entity.pm.PmWorkPackage;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmMilestoneRepository;
import com.softinter.sicapi.repository.pm.PmPhaseRepository;
import com.softinter.sicapi.repository.pm.PmTaskRepository;
import com.softinter.sicapi.service.PhaseService;

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
        phase.setPhaseName(request.getPhaseName());
        phase.setDescription(request.getDescription());
        phase.setStartDate(request.getStartDate());
        phase.setEndDate(request.getEndDate());
        phase.setOwner(request.getOwner());
        phase.setStatus("Not Started");
        phase.setProgress(0);

        if (request.getDependencyId() != null) {
            PmPhase dep = phaseRepository.findById(request.getDependencyId())
                    .orElseThrow(() -> new RuntimeException("Dependency Phase not found"));
            phase.setDependency(dep);
        }

        phase = phaseRepository.save(phase);
        return toResponse(phase);
    }

    @Override
    @Transactional
    public PhaseResponse updatePhase(UUID phaseId, PhaseRequest request) {
        PmPhase phase = phaseRepository.findById(phaseId)
                .orElseThrow(() -> new RuntimeException("Phase not found"));

        phase.setPhaseName(request.getPhaseName());
        phase.setDescription(request.getDescription());
        phase.setStartDate(request.getStartDate());
        phase.setEndDate(request.getEndDate());
        phase.setOwner(request.getOwner());

        if (request.getDependencyId() != null) {
            PmPhase dep = phaseRepository.findById(request.getDependencyId())
                    .orElseThrow(() -> new RuntimeException("Dependency Phase not found"));
            phase.setDependency(dep);
        }

        phase = phaseRepository.save(phase);
        updatePhaseProgress(phase);
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
    }

    // ===== PRIVATE =====
    private PhaseResponse toResponse(PmPhase phase) {
        PhaseResponse dto = new PhaseResponse();
        dto.setId(phase.getId());
        dto.setProjectId(phase.getProject().getId());
        dto.setProjectName(phase.getProject().getProjectName());
        dto.setPhaseName(phase.getPhaseName());
        dto.setDescription(phase.getDescription());
        dto.setStartDate(phase.getStartDate());
        dto.setEndDate(phase.getEndDate());
        dto.setOwner(phase.getOwner());
        dto.setStatus(phase.getStatus());
        dto.setProgress(phase.getProgress());

        if (phase.getDependency() != null) {
            dto.setDependencyId(phase.getDependency().getId());
            dto.setDependencyName(phase.getDependency().getPhaseName());
        }

        // คำนวณสถิติและ map milestones
        int total = 0, completed = 0;
        List<MilestoneResponse> milestoneResponses = new java.util.ArrayList<>();
        for (PmMilestone ms : phase.getMilestones()) {
            if (ms.getIsDelete() != null && ms.getIsDelete()) continue;
            
            MilestoneResponse msDto = toMilestoneResponse(ms);
            milestoneResponses.add(msDto);
            
            for (PmWorkPackage wp : ms.getWorkPackages()) {
                if (wp.getIsDelete() != null && wp.getIsDelete()) continue;
                
                for (PmTask task : wp.getTasks()) {
                    if (task.getIsDelete() == null || !task.getIsDelete()) {
                        total++;
                        if ("Done".equals(task.getStatus())) completed++;
                    }
                }
            }
        }
        dto.setMilestones(milestoneResponses);
        dto.setTaskCount(total);
        dto.setTaskCompletedCount(completed);
        dto.setMilestoneCount(milestoneResponses.size());
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
        return dto;
    }

    private PmCustomerProject getProject(UUID projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

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
}