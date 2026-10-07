package com.softinter.sicapi.scheduler;

import com.softinter.sicapi.service.impl.ContractLifecycleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;

@Slf4j
@Component
@RequiredArgsConstructor
public class ContractLifecycleScheduler {

    private final ContractLifecycleService lifecycleService;

    /** ทุกวัน 08:00 เวลาไทย */
    @Scheduled(cron = "0 0 8 * * *", zone = "Asia/Bangkok")
    public void run() {
        try {
            lifecycleService.runDaily(LocalDate.now(ZoneId.of("Asia/Bangkok")));
        } catch (Exception e) {
            log.error("Error running contract lifecycle job", e);
        }
    }
}
