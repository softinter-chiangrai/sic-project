package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.entity.db.DbMailQueue;
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
        queue.setRecipient(to);
        queue.setSubject(subject);
        queue.setBody(body);
        queue.setIsHtml(isHtml);
        queue.setIsSent(false);
        queue.setRetryCount(0);
        queue.setIsActive(true);
        mailQueueRepository.save(queue);
    }

    @Override
    public void sendTemplatedMail(String to, String templateCode, Object... templateParams) {
        mailTemplateRepository.findByTemplateCodeAndIsActiveTrue(templateCode)
                .ifPresent(template -> {
                    String subject = template.getSubject();
                    String body = template.getBody();
                    for (int i = 0; i < templateParams.length; i++) {
                        body = body.replace("{" + i + "}", String.valueOf(templateParams[i]));
                    }
                    sendMail(to, subject, body, true);
                });
    }

    @Scheduled(fixedDelay = 30000)
    @Transactional
    public void processMailQueue() {
        var unsentMails = mailQueueRepository
                .findByIsSentFalseAndIsActiveTrueAndRetryCountLessThanOrderByCreatedDateAsc(3);

        for (DbMailQueue mail : unsentMails) {
            try {
                if (Boolean.TRUE.equals(mail.getIsHtml())) {
                    MimeMessage mimeMessage = mailSender.createMimeMessage();
                    MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                    helper.setTo(mail.getRecipient());
                    helper.setSubject(mail.getSubject());
                    helper.setText(mail.getBody(), true);
                    mailSender.send(mimeMessage);
                } else {
                    SimpleMailMessage message = new SimpleMailMessage();
                    message.setTo(mail.getRecipient());
                    message.setSubject(mail.getSubject());
                    message.setText(mail.getBody());
                    mailSender.send(message);
                }
                mail.setIsSent(true);
                mail.setErrorMessage(null);
            } catch (Exception e) {
                log.error("Failed to send queued email to {}", mail.getRecipient(), e);
                mail.setRetryCount(mail.getRetryCount() + 1);
                mail.setErrorMessage(e.getMessage());
            }
            mailQueueRepository.save(mail);
        }
    }
}
