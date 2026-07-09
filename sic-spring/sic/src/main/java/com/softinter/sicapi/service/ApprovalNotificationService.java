package com.softinter.sicapi.service;

import com.softinter.sicapi.entity.pm.PmApproval;

public interface ApprovalNotificationService {

    void notifySubmitted(PmApproval approval);
    void notifyApproved(PmApproval approval, String stepName);
    void notifyRejected(PmApproval approval, String stepName);
    void notifyRevisionRequested(PmApproval approval);
    void notifyPendingReminder(PmApproval approval);
    void notifyDelegate(PmApproval approval, String delegatedTo);
}