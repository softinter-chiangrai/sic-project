package com.softinter.sicapi.service.impl;


import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.dto.request.MilestoneRequest;
import com.softinter.sicapi.dto.response.MilestoneResponse;
import com.softinter.sicapi.dto.response.TaskResponse;
import com.softinter.sicapi.dto.response.WorkPackageResponse;
import com.softinter.sicapi.entity.pm.PmMilestone;
import com.softinter.sicapi.entity.pm.PmPhase;
import com.softinter.sicapi.entity.pm.PmTask;
import com.softinter.sicapi.entity.pm.PmWorkPackage;
import com.softinter.sicapi.repository.pm.PmMilestoneRepository;
import com.softinter.sicapi.repository.pm.PmPhaseRepository;
import com.softinter.sicapi.service.MilestoneService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MilestoneServiceImpl implements MilestoneService {

    private final PmMilestoneRepository milestoneRepository;
    private final PmPhaseRepository phaseRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MilestoneResponse> getMilestonesByPhaseId(UUID phaseId) {
        return milestoneRepository.findByPhaseIdAndIsDeleteFalseOrderByDueDateAsc(phaseId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MilestoneResponse getMilestoneById(UUID milestoneId) {
        PmMilestone ms = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));
        return toResponse(ms);
    }

    @Override
    @Transactional
    public MilestoneResponse createMilestone(MilestoneRequest request) {
        PmPhase phase = phaseRepository.findById(request.getPhaseId())
                .orElseThrow(() -> new RuntimeException("Phase not found"));

        PmMilestone ms = new PmMilestone();
        ms.setPhase(phase);
        ms.setMilestoneName(request.getMilestoneName());
        ms.setDescription(request.getDescription());
        ms.setDueDate(request.getDueDate());  
        ms.setStatus("Not Started");

        ms = milestoneRepository.save(ms);
        return toResponse(ms);
    }

    @Override
    @Transactional
    public MilestoneResponse updateMilestone(UUID milestoneId, MilestoneRequest request) {
        PmMilestone ms = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));

        ms.setMilestoneName(request.getMilestoneName());
        ms.setDescription(request.getDescription());
        ms.setDueDate(request.getDueDate());

        ms = milestoneRepository.save(ms);
        return toResponse(ms);
    }

    @Override
    @Transactional
    public void deleteMilestone(UUID milestoneId) {
        PmMilestone ms = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));
        ms.setIsDelete(true);
        milestoneRepository.save(ms);
    }

    private MilestoneResponse toResponse(PmMilestone ms) {
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
}