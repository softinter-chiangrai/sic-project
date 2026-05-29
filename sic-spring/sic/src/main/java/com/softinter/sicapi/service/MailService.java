package com.softinter.sicapi.service;

public interface MailService {
    void sendMail(String to, String subject, String body, boolean isHtml);
    void queueMail(String to, String subject, String body, boolean isHtml);
    void sendTemplatedMail(String to, String templateCode, Object... templateParams);
}
