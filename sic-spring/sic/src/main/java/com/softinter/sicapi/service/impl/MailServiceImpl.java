package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.entity.db.DbMailQueue;
import com.softinter.sicapi.entity.db.DbMailTemplate;
import com.softinter.sicapi.repository.db.DbMailConfigRepository;
import com.softinter.sicapi.repository.db.DbMailQueueRepository;
import com.softinter.sicapi.repository.db.DbMailTemplateRepository;
import com.softinter.sicapi.service.MailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.internet.MimeMessage;
import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailServiceImpl implements MailService {

    private final JavaMailSender mailSender;
    private final DbMailQueueRepository mailQueueRepository;
    private final DbMailTemplateRepository mailTemplateRepository;
    private final DbMailConfigRepository mailConfigRepository;

    @Override
    public void sendMail(String to, String subject, String body, boolean isHtml) {
        try {
            if (isHtml) {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                helper.setTo(to);
                helper.setSubject(subject);
                helper.setText(body, true);
                mailSender.send(mimeMessage);
            } else {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(to);
                message.setSubject(subject);
                message.setText(body);
                mailSender.send(message);
            }
        } catch (Exception e) {
            log.error("Failed to send email to {}", to, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Override
    @Transactional
    public void queueMail(String to, String subject, String body, boolean isHtml) {
        DbMailQueue queue = new DbMailQueue();
        queue.setRecipientEmail(to);
        queue.setBodyData(body);
        queue.setStatus("Pending");
        queue.setRetryCount(0);

        // หา default template
        DbMailTemplate defaultTemplate = mailTemplateRepository.findByTemplateCodeAndIsActiveTrue("DEFAULT_SYSTEM")
                .orElseGet(() -> {
                    return mailTemplateRepository.findAll().stream().findFirst().orElse(null);
                });
                
        queue.setMailTemplate(defaultTemplate);
        mailQueueRepository.save(queue);
    }

    @Override
    public void sendTemplatedMail(String to, String templateCode, Object... templateParams) {
        mailTemplateRepository.findByTemplateCodeAndIsActiveTrue(templateCode)
                .ifPresent(template -> {
                    // ✅ ใช้ getSubjectEn() และ getContentEn()
                    String subject = template.getSubjectEn();
                    String body = template.getContentEn();  // แก้จาก getBody() เป็น getContentEn()
                    
                    if (templateParams != null) {
                        for (int i = 0; i < templateParams.length; i++) {
                            if (templateParams[i] != null) {
                                body = body.replace("{" + i + "}", String.valueOf(templateParams[i]));
                            }
                        }
                    }
                    sendMail(to, subject, body, template.getIsHtml());
                });
    }

    @Scheduled(fixedDelay = 30000)
    @Transactional
    public void processMailQueue() {
        List<DbMailQueue> unsentMails = mailQueueRepository
                .findByStatusAndRetryCountLessThanOrderByCreatedDateAsc("Pending", 3);

        for (DbMailQueue mail : unsentMails) {
            try {
                DbMailTemplate template = mail.getMailTemplate();
                
                // ✅ ดึง subject และ content ตามภาษา (useEnglish)
                String subject;
                String body = mail.getBodyData();
                
                if (template != null) {
                    if (mail.getUseEnglish() != null && mail.getUseEnglish()) {
                        subject = template.getSubjectEn();
                        if (body == null) {
                            body = template.getContentEn();
                        }
                    } else {
                        subject = template.getSubjectLocal();
                        if (body == null) {
                            body = template.getContentLocal();
                        }
                    }
                } else {
                    subject = "No Subject";
                }
                
                if (body == null) {
                    throw new RuntimeException("No email body found");
                }

                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                helper.setTo(mail.getRecipientEmail());
                
                // แทนที่ชื่อผู้รับ
                if (mail.getRecipientName() != null) {
                    body = body.replace("{name}", mail.getRecipientName());
                }
                
                helper.setSubject(subject);
                boolean isHtml = template != null && template.getIsHtml() != null ? template.getIsHtml() : true;
                helper.setText(body, isHtml);
                mailSender.send(mimeMessage);

                mail.setStatus("Sent");
                mail.setSentAt(Instant.now());
                mail.setErrorMessage(null);
                
            } catch (Exception e) {
                log.error("Failed to send queued email to {}", mail.getRecipientEmail(), e);
                mail.setRetryCount(mail.getRetryCount() + 1);
                mail.setErrorMessage(e.getMessage());
                mail.setNextRetryAt(Instant.now().plusSeconds(300));
                
                if (mail.getRetryCount() >= 3) {
                    mail.setStatus("Failed");
                }
            }
            mailQueueRepository.save(mail);
        }
    }
}