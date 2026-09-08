package com.softinter.sicapi.service.impl;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.dto.response.DashboardDeadlineResponse;
import com.softinter.sicapi.dto.response.DashboardProjectHealthResponse;
import com.softinter.sicapi.dto.response.DashboardSummaryResponse;
import com.softinter.sicapi.entity.enums.MaRenewalStatus;
import com.softinter.sicapi.entity.enums.MaTicketStatus;
import com.softinter.sicapi.entity.enums.PaymentStatus;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.entity.pm.PmMaRenewal;
import com.softinter.sicapi.entity.pm.PmTask;
import com.softinter.sicapi.repository.pm.PmBugRepository;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmInvoiceRepository;
import com.softinter.sicapi.repository.pm.PmMaRenewalRepository;
import com.softinter.sicapi.repository.pm.PmMaTicketRepository;
import com.softinter.sicapi.repository.pm.PmTaskRepository;
import com.softinter.sicapi.repository.pm.PmDeliveryRepository;
import com.softinter.sicapi.repository.pm.PmDesignReviewRepository;
import com.softinter.sicapi.repository.pm.PmRequirementRepository;
import com.softinter.sicapi.repository.pm.PmTestCaseRepository;
import com.softinter.sicapi.service.PmDashboardOrgService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PmDashboardOrgServiceImpl implements PmDashboardOrgService {

    private static final Set<String> CLOSED_BUG_STATUSES = Set.of("Closed", "Resolved");
    private static final Set<String> CRITICAL_SEVERITIES = Set.of("CRITICAL");
    private static final Set<String> COMPLETED_PROJECT_STATUSES = Set.of("Done", "Delivered", "Closed");
    private static final Set<String> DELAYED_PROJECT_STATUSES = Set.of("Delayed");
    private static final Set<String> DONE_TASK_STATUSES = Set.of("Done", "Complete", "Completed");
    private static final Set<PaymentStatus> OUTSTANDING_PAYMENT_STATUSES =
            Set.of(PaymentStatus.UNPAID, PaymentStatus.PARTIAL, PaymentStatus.OVERDUE);
    private static final Set<MaTicketStatus> CLOSED_TICKET_STATUSES =
            Set.of(MaTicketStatus.RESOLVED, MaTicketStatus.CLOSED);
    private static final Set<MaRenewalStatus> FINAL_RENEWAL_STATUSES =
            Set.of(MaRenewalStatus.CONFIRMED, MaRenewalStatus.REJECTED, MaRenewalStatus.EXPIRED);
    private static final int NEAR_EXPIRY_DAYS = 30;

    private final PmCustomerProjectRepository projectRepository;
    private final PmBugRepository bugRepository;
    private final PmInvoiceRepository invoiceRepository;
    private final PmMaTicketRepository maTicketRepository;
    private final PmMaRenewalRepository maRenewalRepository;
    private final PmTaskRepository taskRepository;
    private final PmRequirementRepository requirementRepository;
    private final PmDesignReviewRepository designReviewRepository;
    private final PmTestCaseRepository testCaseRepository;
    private final PmDeliveryRepository deliveryRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary(UUID businessId) {
        DashboardSummaryResponse response = new DashboardSummaryResponse();

        List<PmCustomerProject> projects = projectRepository.findByBusinessIdAndIsDeleteFalse(businessId);
        response.setTotalProjects(projects.size());
        response.setDelayedProjects(projects.stream()
                .filter(p -> p.getStatus() != null && DELAYED_PROJECT_STATUSES.stream().anyMatch(s -> s.equalsIgnoreCase(p.getStatus())))
                .count());
        response.setCompletedProjects(projects.stream()
                .filter(p -> p.getStatus() != null && COMPLETED_PROJECT_STATUSES.stream().anyMatch(s -> s.equalsIgnoreCase(p.getStatus())))
                .count());
        response.setActiveProjects(Math.max(0, response.getTotalProjects() - response.getDelayedProjects() - response.getCompletedProjects()));

        // Bugs
        long openBugs = bugRepository.countByBusinessIdAndStatusNotInAndIsDeleteFalse(businessId, CLOSED_BUG_STATUSES);
        long criticalBugs = bugRepository.countByBusinessIdAndSeverityInAndStatusNotInAndIsDeleteFalse(
                businessId, CRITICAL_SEVERITIES, CLOSED_BUG_STATUSES);
        response.setOpenBugs(openBugs);
        response.setCriticalOpenBugs(criticalBugs);

        long totalBugs = bugRepository.countByBusinessIdAndIsDeleteFalse(businessId);
        response.setTotalBugs(totalBugs);
        response.setClosedBugs(totalBugs - openBugs);
        response.setHighBugs(bugRepository.countByBusinessIdAndSeverityIgnoreCaseAndIsDeleteFalse(businessId, "HIGH"));
        response.setMediumBugs(bugRepository.countByBusinessIdAndSeverityIgnoreCaseAndIsDeleteFalse(businessId, "MEDIUM"));
        response.setLowBugs(bugRepository.countByBusinessIdAndSeverityIgnoreCaseAndIsDeleteFalse(businessId, "LOW"));

        // Finance / Invoice
        response.setPendingInvoiceCount(invoiceRepository.countByBusinessIdAndPaymentStatusInAndIsDeleteFalse(
                businessId, OUTSTANDING_PAYMENT_STATUSES));
        BigDecimal outstanding = invoiceRepository.sumOutstandingAmount(businessId, OUTSTANDING_PAYMENT_STATUSES);
        response.setPendingInvoiceAmount(outstanding != null ? outstanding : BigDecimal.ZERO);

        // MA
        response.setOpenMaTickets(maTicketRepository.countByBusinessIdAndStatusNotInAndIsDeleteFalse(
                businessId, CLOSED_TICKET_STATUSES));

        Instant now = Instant.now();
        List<PmMaRenewal> nearExpiry = maRenewalRepository.findNearExpiry(
                businessId, FINAL_RENEWAL_STATUSES, now, now.plus(NEAR_EXPIRY_DAYS, ChronoUnit.DAYS));
        response.setContractsNearExpiry(nearExpiry.size());

        // SDLC Funnel Counts
        response.setStageRequirementsCount(requirementRepository.countByBusinessIdAndIsDeleteFalse(businessId));
        response.setStageDesignReviewsCount(designReviewRepository.countByBusinessIdAndIsDeleteFalse(businessId));
        response.setStageDevTasksCount(taskRepository.countByBusinessIdAndIsDeleteFalse(businessId));
        response.setStageTestCasesCount(testCaseRepository.countByBusinessIdAndIsDeleteFalse(businessId));
        response.setStageDeliveriesCount(deliveryRepository.countByBusinessIdAndIsDeleteFalse(businessId));

        // Test Management Metrics
        long totalTestCases = testCaseRepository.countByBusinessIdAndIsDeleteFalse(businessId);
        response.setTotalTestCases(totalTestCases);
        response.setPassedTestCases(testCaseRepository.countByBusinessIdAndTestStatusIgnoreCaseAndIsDeleteFalse(businessId, "Passed"));
        response.setFailedTestCases(testCaseRepository.countByBusinessIdAndTestStatusIgnoreCaseAndIsDeleteFalse(businessId, "Failed"));
        response.setPendingTestCases(testCaseRepository.countByBusinessIdAndTestStatusIgnoreCaseAndIsDeleteFalse(businessId, "Pending"));

        // Manday Burn Rate
        long totalBudgetManday = projects.stream()
                .mapToLong(p -> p.getBudgetManday() != null ? p.getBudgetManday() : 0)
                .sum();
        long totalUsedManday = projects.stream()
                .mapToLong(p -> p.getUsedManday() != null ? p.getUsedManday() : 0)
                .sum();
        response.setTotalBudgetManday(totalBudgetManday);
        response.setTotalUsedManday(totalUsedManday);

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DashboardDeadlineResponse> getUpcomingDeadlines(UUID businessId, int limit) {
        Pageable pageable = PageRequest.of(0, Math.max(limit, 1));
        List<PmTask> tasks = taskRepository.findUpcomingByBusinessId(businessId, DONE_TASK_STATUSES, pageable);
        Instant now = Instant.now();

        return tasks.stream().map(task -> {
            DashboardDeadlineResponse dto = new DashboardDeadlineResponse();
            dto.setTaskId(task.getId());
            dto.setTaskCode(task.getTaskCode());
            dto.setTaskName(task.getTaskName());
            dto.setStatus(task.getStatus());
            dto.setEndDate(task.getEndDate());

            long daysLeft = ChronoUnit.DAYS.between(now, task.getEndDate());
            dto.setDaysLeft(daysLeft);
            dto.setOverdue(daysLeft < 0);

            PmCustomerProject project = task.getWorkPackage() != null && task.getWorkPackage().getMilestone() != null
                    && task.getWorkPackage().getMilestone().getPhase() != null
                    ? task.getWorkPackage().getMilestone().getPhase().getProject()
                    : null;
            if (project != null) {
                dto.setProjectId(project.getId());
                dto.setProjectName(project.getProjectName());
            }
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DashboardProjectHealthResponse> getAtRiskProjects(UUID businessId, int limit) {
        List<PmCustomerProject> projects = projectRepository.findByBusinessIdAndIsDeleteFalse(businessId);

        return projects.stream()
                .map(this::toHealth)
                .sorted(Comparator.comparingInt(DashboardProjectHealthResponse::getScore))
                .limit(Math.max(limit, 1))
                .collect(Collectors.toList());
    }

    private DashboardProjectHealthResponse toHealth(PmCustomerProject project) {
        DashboardProjectHealthResponse dto = new DashboardProjectHealthResponse();
        dto.setProjectId(project.getId());
        dto.setProjectCode(project.getProjectCode());
        dto.setProjectName(project.getProjectName());
        dto.setStatus(project.getStatus());

        // Manday control - weight 40
        int mandayScore = 40;
        Integer budget = project.getBudgetManday();
        Integer used = project.getUsedManday();
        if (budget != null && budget > 0 && used != null) {
            double ratio = (double) used / budget;
            if (ratio <= 1.0) mandayScore = 40;
            else if (ratio <= 1.2) mandayScore = 24;
            else if (ratio <= 1.5) mandayScore = 12;
            else mandayScore = 0;
        }

        // Bug quality - weight 30
        int bugScore = 30;
        long bugCount = bugRepository.countByProjectIdAndIsDeleteFalse(project.getId());
        if (bugCount > 0) {
            long openBugCount = bugRepository.countByProjectIdAndStatusNotInAndIsDeleteFalse(project.getId(), CLOSED_BUG_STATUSES);
            double openRatio = (double) openBugCount / bugCount;
            bugScore = Math.max(0, (int) Math.round((1 - openRatio) * 30));
        }

        // Timeline/status - weight 30
        int statusScore = 30;
        if (DELAYED_PROJECT_STATUSES.contains(project.getStatus())) {
            statusScore = 6;
        } else if (!COMPLETED_PROJECT_STATUSES.contains(project.getStatus()) && project.getPlannedEndDate() != null) {
            if (project.getPlannedEndDate().isBefore(Instant.now())) {
                statusScore = 10;
            }
        }

        int totalScore = Math.min(100, Math.max(0, mandayScore + bugScore + statusScore));
        dto.setScore(totalScore);
        dto.setHealthStatus(totalScore < 50 ? "Red" : totalScore < 80 ? "Yellow" : "Green");
        return dto;
    }
}
