package com.softinter.sicapi.util;

import com.softinter.sicapi.entity.su.SuUpload;
import com.softinter.sicapi.repository.su.SuUploadRepository;
import com.softinter.sicapi.service.FileStorageService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * ให้ JRXML ดึงรูปในเอกสารแนบ (su_upload) มาฝังรายงานได้ผ่าน {@link ReportHelper#appendAttachments}
 * Jasper เรียก static method ได้อย่างเดียว จึงเก็บ bean ไว้ใน static field ตอน start
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ReportAttachmentImages {

    private static ReportAttachmentImages instance;

    private final SuUploadRepository uploadRepository;
    private final FileStorageService fileStorageService;

    @PostConstruct
    void register() {
        instance = this;
    }

    /** groupId เป็น UUID หรือ String ของ UUID; ค่าอื่น/null/ไม่มี bean → ว่าง */
    static List<byte[]> load(Object groupId) {
        List<byte[]> images = new ArrayList<>();
        if (instance == null || groupId == null) return images;
        UUID id;
        try {
            id = groupId instanceof UUID u ? u : UUID.fromString(groupId.toString());
        } catch (IllegalArgumentException e) {
            return images;
        }
        for (SuUpload u : instance.uploadRepository.findAllByUploadGroupIdAndIsActiveTrueOrderByCreatedDateDesc(id)) {
            if (u.getContentType() == null || !u.getContentType().startsWith("image/")) continue;
            try (InputStream in = instance.fileStorageService.downloadFile(u.getId()).getInputStream()) {
                images.add(in.readAllBytes());
            } catch (Exception e) {
                log.warn("Skip attachment image {} in report: {}", u.getId(), e.getMessage());
            }
        }
        return images;
    }
}