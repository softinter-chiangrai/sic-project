package com.softinter.sicapi.service.impl;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.request.PhaseRequest;
import com.softinter.sicapi.dto.response.PhaseResponse;
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

        // คำนวณสถิติ
        int total = 0, completed = 0;
        for (PmMilestone ms : phase.getMilestones()) {
            for (PmWorkPackage wp : ms.getWorkPackages()) {
                for (PmTask task : wp.getTasks()) {
                    if (!task.getIsDelete()) {
                        total++;
                        if ("Done".equals(task.getStatus())) completed++;
                    }
                }
            }
        }
        dto.setTaskCount(total);
        dto.setTaskCompletedCount(completed);
        dto.setMilestoneCount(phase.getMilestones().size());
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