package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.response.PmProjectDashboardPhaseSummary;
import com.softinter.sicapi.dto.response.PmProjectDashboardResponse;
import com.softinter.sicapi.dto.response.PmProjectDashboardTaskSummary;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.entity.pm.PmPhase;
import com.softinter.sicapi.entity.pm.PmTask;
import com.softinter.sicapi.repository.pm.PmBugRepository;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmPhaseRepository;
import com.softinter.sicapi.repository.pm.PmRequirementRepository;
import com.softinter.sicapi.repository.pm.PmTaskRepository;
import com.softinter.sicapi.service.PmProjectDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PmProjectDashboardServiceImpl implements PmProjectDashboardService {

    private final PmCustomerProjectRepository projectRepository;
    private final PmRequirementRepository requirementRepository;
    private final PmBugRepository bugRepository;
    private final PmPhaseRepository phaseRepository;
    private final PmTaskRepository taskRepository;

    private static final Set<String> CLOSED_BUG_STATUSES = Set.of("Closed", "Resolved");

    @Override
    @Transactional(readOnly = true)
    public PmProjectDashboardResponse getDashboard(UUID projectId, UUID businessId) {
        PmCustomerProject project;
        if (businessId != null) {
            project = projectRepository.findByIdAndBusinessIdAndIsDeleteFalse(projectId, businessId)
                    .orElseGet(() -> projectRepository.findByIdAndIsDeleteFalse(projectId)
                            .orElseThrow(() -> new RuntimeException("Project not found: " + projectId)));
        } else {
            project = projectRepository.findByIdAndIsDeleteFalse(projectId)
                    .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));
        }

        PmProjectDashboardResponse response = new PmProjectDashboardResponse();
        response.setId(project.getId());
        response.setProjectCode(project.getProjectCode());
        response.setProjectName(project.getProjectName());
        response.setCustomerId(project.getCustomerId());
        if (project.getCustomer() != null) {
            response.setCustomerName(project.getCustomer().getCompanyNameEn() != null 
                    ? project.getCustomer().getCompanyNameEn() 
                    : project.getCustomer().getCompanyNameLocal());
        }

        response.setContractId(project.getContractId());
        if (project.getContract() != null) {
            response.setContractNo(project.getContract().getContractNo());
        }

        response.setStartDate(project.getStartDate());
        response.setPlannedEndDate(project.getPlannedEndDate());
        response.setActualEndDate(project.getActualEndDate());
        response.setBudgetManday(project.getBudgetManday() != null ? project.getBudgetManday() : 0);
        response.setUsedManday(project.getUsedManday() != null ? project.getUsedManday() : 0);
        response.setStatus(project.getStatus());
        response.setPriority(project.getPriority());
        response.setDescription(project.getDescription());
        response.setIsActive(project.getIsActive() != null ? project.getIsActive() : true);
        response.setRowVersion(project.getRowVersion());

        // Requirements count
        long reqCount = requirementRepository.countByProjectIdAndIsDeleteFalse(projectId);
        response.setRequirementCount((int) reqCount);

        // Bugs count
        long bugCount = bugRepository.countByProjectIdAndIsDeleteFalse(projectId);
        long openBugCount = bugRepository.countByProjectIdAndStatusNotInAndIsDeleteFalse(projectId, CLOSED_BUG_STATUSES);
        response.setBugCount((int) bugCount);
        response.setBugOpenCount((int) openBugCount);

        // Phases & Tasks
        List<PmPhase> phases = phaseRepository.findByProjectIdAndIsDeleteFalseOrderByStartDateAsc(projectId);
        response.setPhaseCount(phases.size());

        List<PmTask> tasks = taskRepository.findByWorkPackageMilestonePhaseProjectIdAndIsDeleteFalse(projectId);
        response.setTaskCount(tasks.size());

        long completedTasks = tasks.stream()
                .filter(t -> "Done".equalsIgnoreCase(t.getStatus()) || "Completed".equalsIgnoreCase(t.getStatus()))
                .count();
        response.setTaskCompletedCount((int) completedTasks);

        // Recent phases (top 5)
        List<PmProjectDashboardPhaseSummary> recentPhases = phases.stream()
                .limit(5)
                .map(this::toPhaseSummary)
                .collect(Collectors.toList());
        response.setRecentPhases(recentPhases);

        // Recent tasks (top 5)
        List<PmProjectDashboardTaskSummary> recentTasks = tasks.stream()
                .limit(5)
                .map(this::toTaskSummary)
                .collect(Collectors.toList());
        response.setRecentTasks(recentTasks);

        return response;
    }

    private PmProjectDashboardPhaseSummary toPhaseSummary(PmPhase phase) {
        PmProjectDashboardPhaseSummary dto = new PmProjectDashboardPhaseSummary();
        dto.setId(phase.getId());
        dto.setPhaseCode(phase.getPhaseName() != null && phase.getPhaseName().length() > 6 
                ? phase.getPhaseName().substring(0, 6).toUpperCase() 
                : "PHASE");
        dto.setPhaseName(phase.getPhaseName());
        dto.setStatus(phase.getStatus() != null ? phase.getStatus() : "Not Started");
        dto.setProgress(phase.getProgress() != null ? phase.getProgress() : 0);
        dto.setEndDate(phase.getEndDate());
        return dto;
    }

    private PmProjectDashboardTaskSummary toTaskSummary(PmTask task) {
        PmProjectDashboardTaskSummary dto = new PmProjectDashboardTaskSummary();
        dto.setId(task.getId());
        dto.setTaskCode(task.getTaskCode());
        dto.setTaskName(task.getTaskName());
        dto.setAssignedTo(task.getAssignedTo());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        return dto;
    }
}
