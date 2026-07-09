package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.entity.pm.PmApproval;
import com.softinter.sicapi.service.ApprovalNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApprovalNotificationServiceImpl implements ApprovalNotificationService {

    @Override
    public void notifySubmitted(PmApproval approval) {
        log.info("🔔 Approval submitted: {} - {}", approval.getDocumentCode(), approval.getDocumentTitle());
        // TODO: Send notification to first approver(s)
        // - In-app notification
        // - Email
        // - Line notification
    }

    @Override
    public void notifyApproved(PmApproval approval, String stepName) {
        log.info("🔔 Approval approved: {} - {} (Step: {})", approval.getDocumentCode(), approval.getDocumentTitle(), stepName);
        // TODO: Notify requester that document was approved
    }

    @Override
    public void notifyRejected(PmApproval approval, String stepName) {
        log.info("🔔 Approval rejected: {} - {} (Step: {})", approval.getDocumentCode(), approval.getDocumentTitle(), stepName);
        // TODO: Notify requester that document was rejected
    }

    @Override
    public void notifyRevisionRequested(PmApproval approval) {
        log.info("🔔 Revision requested: {} - {}", approval.getDocumentCode(), approval.getDocumentTitle());
        // TODO: Notify requester that revision is needed
    }

    @Override
    public void notifyPendingReminder(PmApproval approval) {
        log.info("🔔 Pending approval reminder: {} - {}", approval.getDocumentCode(), approval.getDocumentTitle());
        // TODO: Send reminder to current approver(s)
    }

    @Override
    public void notifyDelegate(PmApproval approval, String delegatedTo) {
        log.info("🔔 Approval delegated: {} - {} -> {}", approval.getDocumentCode(), approval.getDocumentTitle(), delegatedTo);
        // TODO: Notify delegate that they have a new approval task
    }
}