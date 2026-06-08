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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
            log.info("📧 Sending email to: {}", to);
            
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
            log.info("✅ Email sent successfully to: {}", to);
            
        } catch (Exception e) {
            log.error("❌ Failed to send email to: {}", to, e);
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
                String subject = template.getSubjectEn();
                String body = template.getContentEn();
                
                Map<String, String> variables = new HashMap<>();
                variables.put("Recipient", to);
                variables.put("ExpirationMinutes", "1440");
                
                // ✅ ดึง token และ referenceNumber
                String token = null;
                String referenceNumber = null;
                
                if (templateParams != null && templateParams.length > 0) {
                    if (templateParams[0] != null) {
                        token = String.valueOf(templateParams[0]);
                        variables.put("VerifyToken", token);
                        variables.put("token", token);
                    }
                    if (templateParams.length > 1 && templateParams[1] != null) {
                        referenceNumber = String.valueOf(templateParams[1]);
                        variables.put("ReferenceNumber", referenceNumber);
                    }
                    
                    // สร้าง verification link
                    String verificationLink = "http://localhost:5265/api/profile/verify?token=" + token;
                    variables.put("VerificationLink", verificationLink);
                }
                
                // แทนที่ตัวแปร
                for (Map.Entry<String, String> entry : variables.entrySet()) {
                    String placeholder = "{" + entry.getKey() + "}";
                    if (body != null && body.contains(placeholder)) {
                        body = body.replace(placeholder, entry.getValue());
                    }
                    if (subject != null && subject.contains(placeholder)) {
                        subject = subject.replace(placeholder, entry.getValue());
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

                // แทนที่ตัวแปร
                Map<String, String> variables = new HashMap<>();
                if (mail.getRecipientName() != null) {
                    variables.put("name", mail.getRecipientName());
                    variables.put("Name", mail.getRecipientName());
                }
                variables.put("Recipient", mail.getRecipientEmail());
                
                for (Map.Entry<String, String> entry : variables.entrySet()) {
                    body = body.replace("{" + entry.getKey() + "}", entry.getValue());
                }

                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                helper.setTo(mail.getRecipientEmail());
                helper.setSubject(subject);
                boolean isHtml = template != null && template.getIsHtml() != null ? template.getIsHtml() : true;
                helper.setText(body, isHtml);
                mailSender.send(mimeMessage);

                mail.setStatus("Sent");
                mail.setSentAt(Instant.now());
                mail.setErrorMessage(null);
                log.info("✅ Queued email sent to: {}", mail.getRecipientEmail());
                
            } catch (Exception e) {
                log.error("❌ Failed to send queued email to: {}", mail.getRecipientEmail(), e);
                mail.setRetryCount(mail.getRetryCount() + 1);
                mail.setErrorMessage(e.getMessage());
                mail.setNextRetryAt(Instant.now().plusSeconds(300));
                
                if (mail.getRetryCount() >= 3) {
                    mail.setStatus("Failed");
                    log.error("❌ Email permanently failed after 3 retries");
                }
            }
            mailQueueRepository.save(mail);
        }
    }
}