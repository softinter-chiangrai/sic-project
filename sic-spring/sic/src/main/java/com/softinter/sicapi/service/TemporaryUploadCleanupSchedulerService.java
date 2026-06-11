package com.softinter.sicapi.service;

import com.softinter.sicapi.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class TemporaryUploadCleanupSchedulerService {

    private final FileStorageService fileStorageService;

    // รันทุก 1 ชั่วโมง (fixedRate = 3600000 milliseconds)
    @Scheduled(fixedRate = 3600000)
    public void cleanExpiredUploads() {
        log.debug("Running scheduled cleanup of expired temporary uploads");
        fileStorageService.cleanupExpiredTemporaryUploads();
    }

    // (Optional) รันครั้งแรกทันทีที่ application พร้อมทำงาน (เหมือน .NET ที่เรียก RunCleanupAsync ก่อนเข้า loop)
    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        log.info("Application ready – running initial cleanup of expired temporary uploads");
        fileStorageService.cleanupExpiredTemporaryUploads();
    }
}