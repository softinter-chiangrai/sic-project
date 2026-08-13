package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.response.NotificationResponse;
import com.softinter.sicapi.entity.pm.PmApproval;
import com.softinter.sicapi.entity.su.SuNotification;
import com.softinter.sicapi.repository.su.SuNotificationRepository;
import com.softinter.sicapi.service.ApprovalNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApprovalNotificationServiceImpl implements ApprovalNotificationService {

    private final SuNotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public void notifySubmitted(PmApproval approval) {
        log.info("🔔 Approval submitted: {} - {}", approval.getDocumentCode(), approval.getDocumentTitle());
        String recipient = approval.getCurrentStep() != null ? approval.getCurrentStep().getApproverUserId() : null;
        if (recipient != null && !recipient.isBlank()) {
            sendNotification(
                    recipient,
                    approval.getRequestedBy(),
                    approval.getRequestedByName(),
                    "คำขออนุมัติใหม่: " + approval.getDocumentCode(),
                    "มีเอกสาร " + approval.getDocumentTitle() + " รอการอนุมัติจากคุณ",
                    "APPROVAL",
                    "/pm/approval/" + approval.getId()
            );
        }
    }

    @Override
    @Transactional
    public void notifyApproved(PmApproval approval, String stepName) {
        log.info("🔔 Approval approved: {} - {} (Step: {})", approval.getDocumentCode(), approval.getDocumentTitle(), stepName);
        sendNotification(
                approval.getRequestedBy(),
                null,
                "ระบบอนุมัติ",
                "เอกสารผ่านการอนุมัติ: " + approval.getDocumentCode(),
                "เอกสาร " + approval.getDocumentTitle() + " ผ่านขั้นตอน " + stepName + " แล้ว",
                "APPROVAL",
                "/pm/approval/" + approval.getId()
        );
    }

    @Override
    @Transactional
    public void notifyRejected(PmApproval approval, String stepName) {
        log.info("🔔 Approval rejected: {} - {} (Step: {})", approval.getDocumentCode(), approval.getDocumentTitle(), stepName);
        sendNotification(
                approval.getRequestedBy(),
                null,
                "ระบบอนุมัติ",
                "เอกสารไม่อนุมัติ: " + approval.getDocumentCode(),
                "เอกสาร " + approval.getDocumentTitle() + " ถูกปฏิเสธในขั้นตอน " + stepName,
                "APPROVAL",
                "/pm/approval/" + approval.getId()
        );
    }

    @Override
    @Transactional
    public void notifyRevisionRequested(PmApproval approval) {
        log.info("🔔 Revision requested: {} - {}", approval.getDocumentCode(), approval.getDocumentTitle());
        sendNotification(
                approval.getRequestedBy(),
                null,
                "ระบบอนุมัติ",
                "ขอให้แก้ไขเอกสาร: " + approval.getDocumentCode(),
                "เอกสาร " + approval.getDocumentTitle() + " ต้องการการแก้ไขเพิ่มเติม",
                "APPROVAL",
                "/pm/approval/" + approval.getId()
        );
    }

    @Override
    @Transactional
    public void notifyPendingReminder(PmApproval approval) {
        log.info("🔔 Pending approval reminder: {} - {}", approval.getDocumentCode(), approval.getDocumentTitle());
        String recipient = approval.getCurrentStep() != null ? approval.getCurrentStep().getApproverUserId() : null;
        if (recipient != null && !recipient.isBlank()) {
            sendNotification(
                    recipient,
                    null,
                    "ระบบแจ้งเตือน",
                    "เตือนการอนุมัติค้างชำระ: " + approval.getDocumentCode(),
                    "คุณมีเอกสาร " + approval.getDocumentTitle() + " รออนุมัติค้างอยู่ในระบบ",
                    "APPROVAL",
                    "/pm/approval/" + approval.getId()
            );
        }
    }

    @Override
    @Transactional
    public void notifyDelegate(PmApproval approval, String delegatedTo) {
        log.info("🔔 Approval delegated: {} - {} -> {}", approval.getDocumentCode(), approval.getDocumentTitle(), delegatedTo);
        sendNotification(
                delegatedTo,
                approval.getRequestedBy(),
                approval.getRequestedByName(),
                "ได้รับมอบหมายการอนุมัติ: " + approval.getDocumentCode(),
                "คุณได้รับการมอบหมายให้อนุมัติเอกสาร " + approval.getDocumentTitle(),
                "APPROVAL",
                "/pm/approval/" + approval.getId()
        );
    }

    private void sendNotification(String recipientUserId, String senderId, String senderName, String title, String message, String type, String linkUrl) {
        if (recipientUserId == null || recipientUserId.isBlank()) return;

        SuNotification notification = new SuNotification();
        notification.setRecipientUserId(recipientUserId);
        notification.setSenderId(senderId);
        notification.setSenderName(senderName);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setLinkUrl(linkUrl);
        notification.setIsRead(false);

        notification = notificationRepository.save(notification);

        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setRecipientUserId(notification.getRecipientUserId());
        response.setSenderId(notification.getSenderId());
        response.setSenderName(notification.getSenderName());
        response.setTitle(notification.getTitle());
        response.setMessage(notification.getMessage());
        response.setType(notification.getType());
        response.setLinkUrl(notification.getLinkUrl());
        response.setRead(false);
        response.setCreatedDate(notification.getCreatedDate());

        messagingTemplate.convertAndSendToUser(recipientUserId, "/queue/notifications", response);
    }
}