package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.ApprovalSubmitRequest;
import com.softinter.sicapi.entity.enums.ApprovalMode;
import com.softinter.sicapi.entity.enums.ApprovalStatus;
import com.softinter.sicapi.entity.pm.PmApproval;
import com.softinter.sicapi.entity.pm.PmApprovalFlow;
import com.softinter.sicapi.entity.pm.PmApprovalFlowStep;
import com.softinter.sicapi.entity.pm.PmApprovalStepStatus;
import com.softinter.sicapi.entity.pm.PmRequirement;
import com.softinter.sicapi.repository.pm.*;
import com.softinter.sicapi.repository.su.SuProfileRepository;
import com.softinter.sicapi.repository.su.SuUserBusinessRoleRepository;
import com.softinter.sicapi.service.ApprovalNotificationService;
import com.softinter.sicapi.service.AuditLogService;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.DocumentVersionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/** ทดสอบ logic โหมดอนุมัติ CHAIN / PARALLEL / ANY ผ่าน ApprovalServiceImpl จริง (mock เฉพาะ repository) */
class ApprovalModeTest {

    static final String R = "requester", A = "approver-A", B = "approver-B";

    ApprovalServiceImpl service;
    PmApproval saved;
    String currentUser;
    PmApprovalFlow flow;
    List<PmApprovalFlowStep> steps;

    @BeforeEach
    void setUp() {
        PmApprovalRepository approvalRepo = Mockito.mock(PmApprovalRepository.class);
        PmApprovalFlowRepository flowRepo = Mockito.mock(PmApprovalFlowRepository.class);
        PmApprovalFlowStepRepository stepRepo = Mockito.mock(PmApprovalFlowStepRepository.class);
        PmRequirementRepository reqRepo = Mockito.mock(PmRequirementRepository.class);
        CurrentUserService cu = Mockito.mock(CurrentUserService.class);

        when(cu.getUserId()).thenAnswer(i -> currentUser);
        when(cu.getUsername()).thenAnswer(i -> currentUser);
        when(cu.getBusinessId()).thenReturn(UUID.randomUUID());
        when(reqRepo.findById(any())).thenReturn(Optional.of(new PmRequirement()));
        when(approvalRepo.save(any(PmApproval.class))).thenAnswer(i -> {
            saved = i.getArgument(0);
            if (saved.getId() == null) saved.setId(UUID.randomUUID());
            return saved;
        });
        when(approvalRepo.findById(any())).thenAnswer(i -> Optional.ofNullable(saved));
        when(flowRepo.findById(any())).thenAnswer(i -> Optional.of(flow));
        when(stepRepo.findByFlowIdAndIsDeleteFalseOrderByStepOrderAsc(any())).thenAnswer(i -> steps);

        service = new ApprovalServiceImpl(approvalRepo, flowRepo, stepRepo,
                Mockito.mock(PmApprovalStepStatusRepository.class), Mockito.mock(PmApprovalLogRepository.class),
                Mockito.mock(SuUserBusinessRoleRepository.class), Mockito.mock(SuProfileRepository.class), cu,
                Mockito.mock(ApprovalNotificationService.class),
                Mockito.mock(PmChangeRequestRepository.class), Mockito.mock(PmCrAssigneeRepository.class),
                reqRepo, Mockito.mock(PmSpecificationRepository.class), Mockito.mock(PmDesignReviewRepository.class),
                Mockito.mock(PmDiagramTabRepository.class), Mockito.mock(PmCustomerContractRepository.class),
                Mockito.mock(PmCustomerProjectRepository.class), Mockito.mock(PmDeliveryRepository.class),
                Mockito.mock(PmInvoiceRepository.class), Mockito.mock(PmMaTicketRepository.class),
                Mockito.mock(PmUserManualRepository.class),
                Mockito.mock(DocumentVersionService.class), Mockito.mock(AuditLogService.class));
    }

    /** สร้าง flow ตามโหมด โดย approvers[i] คือผู้อนุมัติ step ที่ i+1 แล้วให้ requester ส่งคำขอ */
    void submit(ApprovalMode mode, String... approvers) {
        flow = new PmApprovalFlow();
        flow.setId(UUID.randomUUID());
        flow.setApprovalMode(mode);
        steps = new ArrayList<>();
        for (int i = 0; i < approvers.length; i++) {
            PmApprovalFlowStep s = new PmApprovalFlowStep();
            s.setId(UUID.randomUUID());
            s.setFlow(flow);
            s.setStepOrder(i + 1);
            s.setStepName("step" + (i + 1));
            s.setApproverUserId(approvers[i]);
            steps.add(s);
        }
        ApprovalSubmitRequest req = new ApprovalSubmitRequest();
        req.setDocumentType("REQUIREMENT");
        req.setDocumentId(UUID.randomUUID());
        req.setFlowId(flow.getId());
        currentUser = R;
        service.submitForApproval(req);
    }

    boolean can(String user) {
        return service.canApprove(saved.getId(), user);
    }

    void approveAs(String user) {
        currentUser = user;
        service.approve(saved.getId(), "ok", null);
    }

    PmApprovalStepStatus row(String user) {
        return saved.getStepStatuses().stream().filter(s -> user.equals(s.getApprover())).findFirst().orElseThrow();
    }

    @Test
    void chain_onlyCurrentStepCanAct_thenNextStep() {
        submit(ApprovalMode.CHAIN, A, B);
        assertTrue(can(A));
        assertFalse(can(B), "step 2 ต้องรอ step 1");
        assertThrows(IllegalStateException.class, () -> approveAs(B));
        currentUser = B;
        assertThrows(IllegalStateException.class, () -> service.reject(saved.getId(), "no"),
                "step 2 ปฏิเสธแทน step 1 ไม่ได้");

        approveAs(A);
        assertEquals(ApprovalStatus.PENDING, saved.getStatus());
        assertTrue(can(B));
        assertFalse(can(A));
        assertEquals(steps.get(1).getId(), saved.getCurrentStep().getId());

        approveAs(B);
        assertEquals(ApprovalStatus.APPROVED, saved.getStatus());
    }

    @Test
    void chain_requesterInFirstStep_autoApprovedThenWaitsForNext() {
        submit(ApprovalMode.CHAIN, R, B);
        assertEquals(ApprovalStatus.PENDING, saved.getStatus());
        assertTrue(can(B));
        approveAs(B);
        assertEquals(ApprovalStatus.APPROVED, saved.getStatus());
    }

    @Test
    void parallel_everyoneCanActAtOnce_allMustApprove() {
        submit(ApprovalMode.PARALLEL, A, B);
        assertTrue(can(A));
        assertTrue(can(B));

        approveAs(B); // ลำดับไหนก็ได้
        assertEquals(ApprovalStatus.PENDING, saved.getStatus());
        assertFalse(can(B));
        assertTrue(can(A));

        approveAs(A);
        assertEquals(ApprovalStatus.APPROVED, saved.getStatus());
    }

    @Test
    void parallel_oneRejectClosesRequest() {
        submit(ApprovalMode.PARALLEL, A, B);
        currentUser = B;
        service.reject(saved.getId(), "no");
        assertEquals(ApprovalStatus.REJECTED, saved.getStatus());
    }

    @Test
    void any_firstApprovalFinishesAndSkipsOthers() {
        submit(ApprovalMode.ANY, A, B);
        assertTrue(can(A));
        assertTrue(can(B));

        approveAs(B);
        assertEquals(ApprovalStatus.APPROVED, saved.getStatus());
        assertEquals(ApprovalStatus.SKIPPED, row(A).getStatus());
        assertFalse(can(A), "คำขอจบแล้ว");
    }

    @Test
    void any_requesterIsApprover_approvedAtSubmit() {
        submit(ApprovalMode.ANY, R, B);
        assertEquals(ApprovalStatus.APPROVED, saved.getStatus());
        assertEquals(ApprovalStatus.SKIPPED, row(B).getStatus());
    }
}
