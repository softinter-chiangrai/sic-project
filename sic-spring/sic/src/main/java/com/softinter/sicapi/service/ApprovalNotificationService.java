package com.softinter.sicapi.service;

import com.softinter.sicapi.entity.pm.PmApproval;
import java.util.UUID;

public interface ApprovalNotificationService {

    void notifySubmitted(PmApproval approval);
    void notifyApproved(PmApproval approval, String stepName);
    void notifyRejected(PmApproval approval, String stepName);
    void notifyRevisionRequested(PmApproval approval);
    void notifyPendingReminder(PmApproval approval);
    void notifyDelegate(PmApproval approval, String delegatedTo);

    /** แจ้งเตือนผู้ใช้โดยตรง (ระบบเป็นผู้ส่ง) ใช้กับงานตั้งเวลา เช่น เตือนสัญญาใกล้หมดอายุ */
    void notifyUser(UUID businessId, String recipientUserId, String title, String message, String type, String linkUrl);
}