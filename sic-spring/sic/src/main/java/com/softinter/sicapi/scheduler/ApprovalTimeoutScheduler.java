package com.softinter.sicapi.scheduler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.softinter.sicapi.service.ApprovalService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ApprovalTimeoutScheduler {

    private static final Logger log = LoggerFactory.getLogger(ApprovalTimeoutScheduler.class);
    private final ApprovalService approvalService;

    /**
     * Run every 15 minutes to process timeout workflows (SLA Breach)
     */
    @Scheduled(cron = "0 0/15 * * * *")
    public void processApprovalTimeouts() {
        log.info("Starting scheduled job: ApprovalTimeoutScheduler");
        try {
            approvalService.processTimeouts();
            log.info("Finished scheduled job: ApprovalTimeoutScheduler");
        } catch (Exception e) {
            log.error("Error processing approval timeouts in scheduler", e);
        }
    }
}
