package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.PmUserManualRequest;
import com.softinter.sicapi.dto.request.PmUserManualSectionRequest;
import com.softinter.sicapi.dto.response.PmUserManualResponse;
import com.softinter.sicapi.dto.response.PmUserManualSectionResponse;
import com.softinter.sicapi.entity.enums.EntityState;
import com.softinter.sicapi.entity.pm.PmUserManual;
import com.softinter.sicapi.entity.pm.PmUserManualSection;
import com.softinter.sicapi.repository.pm.PmUserManualRepository;
import com.softinter.sicapi.repository.pm.PmUserManualSectionRepository;
import com.softinter.sicapi.service.DocumentVersionService;
import com.softinter.sicapi.service.PmUserManualService;
import com.softinter.sicapi.util.DocumentDiffHelper;
import com.softinter.sicapi.util.JsonSnapshotHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PmUserManualServiceImpl implements PmUserManualService {

    private final PmUserManualRepository manualRepository;
    private final PmUserManualSectionRepository sectionRepository;
    private final DocumentVersionService documentVersionService;

    @Override
    @Transactional(readOnly = true)
    public Page<PmUserManualResponse> findAll(UUID businessId, UUID projectId, Pageable pageable) {
        Page<PmUserManual> page;
        if (projectId != null) {
            page = manualRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(businessId, projectId, pageable);
        } else {
            page = manualRepository.findByBusinessIdAndIsDeleteFalse(businessId, pageable);
        }
        return page.map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PmUserManualResponse findById(UUID id, UUID businessId) {
        PmUserManual manual = manualRepository.findByIdAndBusinessIdAndIsDeleteFalse(id, businessId)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลคู่มือผู้ใช้งาน"));
        PmUserManualResponse response = toResponse(manual);
        List<PmUserManualSectionResponse> sections = sectionRepository
                .findByManualIdAndIsDeleteFalseOrderBySortOrderAsc(manual.getId())
                .stream()
                .map(this::toSectionResponse)
                .collect(Collectors.toList());
        response.setSections(sections);
        return response;
    }

    @Override
    @Transactional
    public UUID save(PmUserManualRequest request, UUID businessId, String userId) {
        EntityState state = request.getState() != null ? EntityState.values()[request.getState()] : EntityState.DETACHED;
        PmUserManual entity;

        String diffSummary = "สร้างคู่มือการใช้งาน (Initial user manual)";
        if (state == EntityState.ADDED || request.getId() == null) {
            entity = new PmUserManual();
            entity.setBusinessId(businessId);
            entity.setCreatedBy(userId);
            entity.setCreatedDate(Instant.now());
            mapRequestToEntity(request, entity);
            entity = manualRepository.save(entity);
        } else if (state == EntityState.MODIFIED) {
            entity = manualRepository.findByIdAndBusinessIdAndIsDeleteFalse(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลคู่มือผู้ใช้งาน"));
            if (request.getRowVersion() != null && !request.getRowVersion().equals(entity.getRowVersion())) {
                throw new RuntimeException("ข้อมูลถูกแก้ไขโดยผู้อื่น กรุณารีเฟรชข้อมูล");
            }

            // ✅ Auto Diff Detection
            List<String> changes = new ArrayList<>();
            DocumentDiffHelper.checkChange(changes, "ชื่อคู่มือ (Title)", entity.getManualTitle(), request.getManualTitle());
            DocumentDiffHelper.checkChange(changes, "ประเภทคู่มือ (Type)", entity.getManualType(), request.getManualType());
            DocumentDiffHelper.checkChange(changes, "เวอร์ชัน (Version)", entity.getVersion(), request.getVersion());
            DocumentDiffHelper.checkChange(changes, "สถานะ (Status)", entity.getStatus(), request.getStatus());
            diffSummary = DocumentDiffHelper.buildDiffSummary(changes, "อัปเดตคู่มือ " + (request.getManualTitle() != null ? request.getManualTitle() : entity.getManualTitle()));

            mapRequestToEntity(request, entity);
            entity.setUpdatedBy(userId);
            entity.setUpdatedDate(Instant.now());
            entity = manualRepository.save(entity);
        } else if (state == EntityState.DELETED) {
            delete(request.getId(), businessId, userId);
            return request.getId();
        } else {
            entity = manualRepository.findByIdAndBusinessIdAndIsDeleteFalse(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลคู่มือผู้ใช้งาน"));
        }

        // Snapshot data
        String snapshotJson = JsonSnapshotHelper.toJson(toResponse(entity));

        // ✅ Create document version
        documentVersionService.createVersion(
                "MANUAL",
                entity.getId(),
                entity.getProjectId(),
                entity.getManualCode(),
                entity.getVersion() != null ? entity.getVersion() : "v0.1",
                diffSummary,
                snapshotJson
        );

        // Handle Sections
        if (request.getSections() != null) {
            for (PmUserManualSectionRequest secReq : request.getSections()) {
                EntityState secState = secReq.getState() != null ? EntityState.values()[secReq.getState()] : EntityState.DETACHED;
                if (secState == EntityState.ADDED || secReq.getId() == null) {
                    PmUserManualSection sec = new PmUserManualSection();
                    sec.setManualId(entity.getId());
                    sec.setCreatedBy(userId);
                    sec.setCreatedDate(Instant.now());
                    mapSectionRequestToEntity(secReq, sec);
                    sectionRepository.save(sec);
                } else if (secState == EntityState.MODIFIED) {
                    PmUserManualSection sec = sectionRepository.findById(secReq.getId())
                            .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูล Section คู่มือ"));
                    mapSectionRequestToEntity(secReq, sec);
                    sec.setUpdatedBy(userId);
                    sec.setUpdatedDate(Instant.now());
                    sectionRepository.save(sec);
                } else if (secState == EntityState.DELETED) {
                    sectionRepository.findById(secReq.getId()).ifPresent(sec -> {
                        sec.setIsDelete(true);
                        sec.setDeleteBy(userId);
                        sec.setDeleteDate(Instant.now());
                        sectionRepository.save(sec);
                    });
                }
            }
        }

        return entity.getId();
    }

    @Override
    @Transactional
    public void delete(UUID id, UUID businessId, String userId) {
        PmUserManual manual = manualRepository.findByIdAndBusinessIdAndIsDeleteFalse(id, businessId)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลคู่มือผู้ใช้งาน"));
        manual.setIsDelete(true);
        manual.setDeleteBy(userId);
        manual.setDeleteDate(Instant.now());
        manualRepository.save(manual);
    }

    private void mapRequestToEntity(PmUserManualRequest req, PmUserManual entity) {
        entity.setProjectId(req.getProjectId());
        entity.setManualCode(req.getManualCode());
        entity.setManualTitle(req.getManualTitle());
        entity.setManualType(req.getManualType() != null ? req.getManualType() : "USER");
        entity.setVersion(req.getVersion() != null ? req.getVersion() : "0.1");
        entity.setRelatedSpecId(req.getRelatedSpecId());
        entity.setDeliveryId(req.getDeliveryId());
        entity.setStatus(req.getStatus() != null ? req.getStatus() : "DRAFT");
        entity.setAttachmentGroupId(req.getAttachmentGroupId());
    }

    private void mapSectionRequestToEntity(PmUserManualSectionRequest req, PmUserManualSection entity) {
        entity.setSectionCode(req.getSectionCode());
        entity.setSectionTitle(req.getSectionTitle());
        entity.setContent(req.getContent());
        entity.setSortOrder(req.getSortOrder() != null ? req.getSortOrder() : 0);
        entity.setPermissionRoles(req.getPermissionRoles());
        entity.setScreenshotGroupId(req.getScreenshotGroupId());
    }

    private PmUserManualResponse toResponse(PmUserManual entity) {
        PmUserManualResponse res = new PmUserManualResponse();
        res.setId(entity.getId());
        res.setBusinessId(entity.getBusinessId());
        res.setProjectId(entity.getProjectId());
        res.setManualCode(entity.getManualCode());
        res.setManualTitle(entity.getManualTitle());
        res.setManualType(entity.getManualType());
        res.setVersion(entity.getVersion());
        res.setRelatedSpecId(entity.getRelatedSpecId());
        res.setDeliveryId(entity.getDeliveryId());
        res.setStatus(entity.getStatus());
        res.setAttachmentGroupId(entity.getAttachmentGroupId());
        res.setCreatedBy(entity.getCreatedBy());
        res.setCreatedDate(entity.getCreatedDate());
        res.setUpdatedBy(entity.getUpdatedBy());
        res.setUpdatedDate(entity.getUpdatedDate());
        res.setRowVersion(entity.getRowVersion());
        return res;
    }

    private PmUserManualSectionResponse toSectionResponse(PmUserManualSection entity) {
        PmUserManualSectionResponse res = new PmUserManualSectionResponse();
        res.setId(entity.getId());
        res.setManualId(entity.getManualId());
        res.setSectionCode(entity.getSectionCode());
        res.setSectionTitle(entity.getSectionTitle());
        res.setContent(entity.getContent());
        res.setSortOrder(entity.getSortOrder());
        res.setPermissionRoles(entity.getPermissionRoles());
        res.setScreenshotGroupId(entity.getScreenshotGroupId());
        res.setRowVersion(entity.getRowVersion());
        return res;
    }
}
