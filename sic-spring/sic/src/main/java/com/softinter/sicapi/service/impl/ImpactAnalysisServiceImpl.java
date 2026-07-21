// src/main/java/com/softinter/sicapi/service/impl/ImpactAnalysisServiceImpl.java

package com.softinter.sicapi.service.impl;

import java.time.Instant;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.dto.request.SaveImpactAnalysisRequest;
import com.softinter.sicapi.dto.response.ImpactAnalysisResponse;
import com.softinter.sicapi.entity.pm.ChangeImpactAnalysis;
import com.softinter.sicapi.entity.pm.PmRequirementChangeRequest;
import com.softinter.sicapi.repository.pm.ChangeImpactAnalysisRepository;
import com.softinter.sicapi.repository.pm.PmRequirementChangeRequestRepository;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.ImpactAnalysisService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImpactAnalysisServiceImpl implements ImpactAnalysisService {

    private final ChangeImpactAnalysisRepository repository;
    private final PmRequirementChangeRequestRepository changeRequestRepository;
    private final CurrentUserService currentUserService;

    @Override
    @Transactional(readOnly = true)
    public ImpactAnalysisResponse getByChangeRequest(UUID changeRequestId) {
        return repository.findByChangeRequestId(changeRequestId)
                .map(this::toResponse)
                .orElse(null);
    }

    @Override
    @Transactional
    public UUID save(SaveImpactAnalysisRequest request) {
        // ใช้เฉพาะกรณี Manual หรือบันทึกทั่วไป (ไม่ใช้ใน autoDetect)
        PmRequirementChangeRequest changeRequest = changeRequestRepository
                .findById(request.getChangeRequestId())
                .orElseThrow(() -> new RuntimeException("Change Request not found"));

        ChangeImpactAnalysis analysis = repository
                .findByChangeRequestId(request.getChangeRequestId())
                .orElse(new ChangeImpactAnalysis());

        analysis.setChangeRequest(changeRequest);
        analysis.setDfdImpact(request.getDfdImpact());
        analysis.setErImpact(request.getErImpact());
        analysis.setUiImpact(request.getUiImpact());
        analysis.setApiImpact(request.getApiImpact());
        analysis.setTestImpact(request.getTestImpact());
        analysis.setMandayImpact(request.getMandayImpact());
        analysis.setTimelineImpact(request.getTimelineImpact());
        analysis.setCostImpact(request.getCostImpact());

        analysis.setImpactedRequirementIds(request.getImpactedRequirementIds());
        analysis.setImpactedSpecIds(request.getImpactedSpecIds());
        analysis.setImpactedTaskIds(request.getImpactedTaskIds());
        analysis.setImpactedTestCaseIds(request.getImpactedTestCaseIds());
        analysis.setImpactedBugIds(request.getImpactedBugIds());
        analysis.setImpactedTableNames(request.getImpactedTableNames());

        if (analysis.getAnalysisStatus() == null) {
            analysis.setAnalysisStatus("MANUAL");
        }
        analysis.setAnalyzedAt(Instant.now());
        analysis.setAnalyzedBy(currentUserService.getUserId());

        ChangeImpactAnalysis saved = repository.save(analysis);
        log.info("Impact Analysis saved (MANUAL) for change request: {}", request.getChangeRequestId());
        return saved.getId();
    }

    // ============================================================
    // ✅ แก้ไข autoDetect – บันทึกเพียงครั้งเดียว
    // ============================================================
    @Override
    @Transactional
    public ImpactAnalysisResponse autoDetect(UUID changeRequestId) {
        log.info("Starting auto-detect for change request: {}", changeRequestId);

        // 1. โหลด Change Request (เพื่อใช้อ้างอิง)
        PmRequirementChangeRequest changeRequest = changeRequestRepository
                .findById(changeRequestId)
                .orElseThrow(() -> new RuntimeException("Change Request not found"));

        // 2. ดึงหรือสร้าง Entity
        ChangeImpactAnalysis analysis = repository
                .findByChangeRequestId(changeRequestId)
                .orElse(new ChangeImpactAnalysis());

        // 3. เรียก PostgreSQL function เพื่อหา impacted ids
        try {
            Object[] result = repository.autoDetectByChangeRequest(changeRequestId);
            UUID[] reqIds = new UUID[0];
            UUID[] specIds = new UUID[0];
            UUID[] taskIds = new UUID[0];
            UUID[] testCaseIds = new UUID[0];
            UUID[] bugIds = new UUID[0];

            if (result != null && result.length > 0) {
                Object first = result[0];
                if (first instanceof Object[]) {
                    Object[] arrays = (Object[]) first;
                    if (arrays.length >= 5) {
                        reqIds = convertToUuidArray(arrays[0]);
                        specIds = convertToUuidArray(arrays[1]);
                        taskIds = convertToUuidArray(arrays[2]);
                        testCaseIds = convertToUuidArray(arrays[3]);
                        bugIds = convertToUuidArray(arrays[4]);
                    }
                } else if (result.length >= 5) {
                    reqIds = convertToUuidArray(result[0]);
                    specIds = convertToUuidArray(result[1]);
                    taskIds = convertToUuidArray(result[2]);
                    testCaseIds = convertToUuidArray(result[3]);
                    bugIds = convertToUuidArray(result[4]);
                } else {
                    // fallback
                    reqIds = convertToUuidArray(result[0]);
                }
            }

            // 4. ตั้งค่าข้อมูลลง entity
            analysis.setChangeRequest(changeRequest);
            analysis.setImpactedRequirementIds(reqIds);
            analysis.setImpactedSpecIds(specIds);
            analysis.setImpactedTaskIds(taskIds);
            analysis.setImpactedTestCaseIds(testCaseIds);
            analysis.setImpactedBugIds(bugIds);

            // 5. ตั้งสถานะ AUTO และเวลาวิเคราะห์
            analysis.setAnalysisStatus("AUTO");
            analysis.setAnalyzedAt(Instant.now());
            analysis.setAnalyzedBy(currentUserService.getUserId());

            // 6. ✅ บันทึกครั้งเดียว (ไม่ต้องเรียก save() ซ้อน)
            ChangeImpactAnalysis saved = repository.save(analysis);
            log.info("Auto-detect completed and saved for change request: {}", changeRequestId);

            // 7. สร้าง Response
            return toResponse(saved);

        } catch (Exception e) {
            log.error("Auto-detect failed for change request: {}", changeRequestId, e);
            throw new RuntimeException("Auto-detect failed: " + e.getMessage(), e);
        }
    }

    // ===== Helper: convert object to UUID array =====
    private UUID[] convertToUuidArray(Object obj) {
        if (obj == null) return new UUID[0];
        try {
            if (obj instanceof java.sql.Array) {
                Object[] elements = (Object[]) ((java.sql.Array) obj).getArray();
                return convertToUuidArray(elements);
            }
            if (obj instanceof Object[]) {
                Object[] elements = (Object[]) obj;
                UUID[] result = new UUID[elements.length];
                for (int i = 0; i < elements.length; i++) {
                    if (elements[i] != null) {
                        result[i] = UUID.fromString(elements[i].toString());
                    }
                }
                return result;
            }
            if (obj instanceof String) {
                String str = (String) obj;
                if (str.startsWith("{") && str.endsWith("}")) {
                    String content = str.substring(1, str.length() - 1);
                    if (content.isEmpty()) return new UUID[0];
                    String[] parts = content.split(",");
                    UUID[] result = new UUID[parts.length];
                    for (int i = 0; i < parts.length; i++) {
                        result[i] = UUID.fromString(parts[i].trim());
                    }
                    return result;
                }
                try {
                    return new UUID[]{UUID.fromString(str)};
                } catch (IllegalArgumentException e) {
                    return new UUID[0];
                }
            }
            return new UUID[0];
        } catch (Exception e) {
            log.warn("Failed to convert to UUID array: {}", e.getMessage());
            return new UUID[0];
        }
    }

    // ===== toResponse =====
    private ImpactAnalysisResponse toResponse(ChangeImpactAnalysis entity) {
        ImpactAnalysisResponse dto = new ImpactAnalysisResponse();
        dto.setId(entity.getId());
        dto.setChangeRequestId(entity.getChangeRequest().getId());
        dto.setDfdImpact(entity.getDfdImpact());
        dto.setErImpact(entity.getErImpact());
        dto.setUiImpact(entity.getUiImpact());
        dto.setApiImpact(entity.getApiImpact());
        dto.setTestImpact(entity.getTestImpact());
        dto.setMandayImpact(entity.getMandayImpact());
        dto.setTimelineImpact(entity.getTimelineImpact());
        dto.setCostImpact(entity.getCostImpact());
        dto.setImpactedRequirementIds(entity.getImpactedRequirementIds());
        dto.setImpactedSpecIds(entity.getImpactedSpecIds());
        dto.setImpactedTaskIds(entity.getImpactedTaskIds());
        dto.setImpactedTestCaseIds(entity.getImpactedTestCaseIds());
        dto.setImpactedBugIds(entity.getImpactedBugIds());
        dto.setImpactedTableNames(entity.getImpactedTableNames());
        dto.setAnalysisStatus(entity.getAnalysisStatus());
        dto.setAnalyzedAt(entity.getAnalyzedAt());
        dto.setAnalyzedBy(entity.getAnalyzedBy());
        return dto;
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        repository.deleteById(id);
        log.info("Impact Analysis deleted: {}", id);
    }
}