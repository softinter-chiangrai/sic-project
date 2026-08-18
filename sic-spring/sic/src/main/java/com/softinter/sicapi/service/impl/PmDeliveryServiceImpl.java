package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.PmDeliveryChecklistRequest;
import com.softinter.sicapi.dto.request.PmDeliveryRequest;
import com.softinter.sicapi.dto.response.PmDeliveryChecklistResponse;
import com.softinter.sicapi.dto.response.PmDeliveryGateCheckResponse;
import com.softinter.sicapi.dto.response.PmDeliveryResponse;
import com.softinter.sicapi.entity.enums.EntityState;
import com.softinter.sicapi.entity.pm.PmDelivery;
import com.softinter.sicapi.entity.pm.PmDeliveryChecklist;
import com.softinter.sicapi.entity.pm.PmRequirement;
import com.softinter.sicapi.entity.pm.PmSpecification;
import com.softinter.sicapi.repository.pm.*;
import com.softinter.sicapi.service.ApprovalService;
import com.softinter.sicapi.service.DocumentVersionService;
import com.softinter.sicapi.service.PmDeliveryService;
import com.softinter.sicapi.util.DocumentDiffHelper;
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
public class PmDeliveryServiceImpl implements PmDeliveryService {

    private final PmDeliveryRepository deliveryRepository;
    private final PmDeliveryChecklistRepository checklistRepository;
    private final PmRequirementRepository requirementRepository;
    private final PmSpecificationRepository specificationRepository;
    private final PmBugRepository bugRepository;
    private final PmTestCaseRepository testCaseRepository;

    private final ApprovalService approvalService;
    private final DocumentVersionService documentVersionService;

    @Override
    @Transactional(readOnly = true)
    public Page<PmDeliveryResponse> findAll(UUID businessId, UUID projectId, Pageable pageable) {
        Page<PmDelivery> page;
        if (projectId != null) {
            page = deliveryRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(businessId, projectId, pageable);
        } else {
            page = deliveryRepository.findByBusinessIdAndIsDeleteFalse(businessId, pageable);
        }
        return page.map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PmDeliveryResponse findById(UUID id, UUID businessId) {
        PmDelivery delivery = deliveryRepository.findByIdAndBusinessIdAndIsDeleteFalse(id, businessId)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลการส่งมอบ"));
        PmDeliveryResponse response = toResponse(delivery);
        List<PmDeliveryChecklistResponse> checklists = checklistRepository
                .findByDeliveryIdAndIsDeleteFalseOrderBySortOrderAsc(delivery.getId())
                .stream()
                .map(this::toChecklistResponse)
                .collect(Collectors.toList());
        response.setChecklists(checklists);
        return response;
    }

    @Override
    @Transactional
    public UUID save(PmDeliveryRequest request, UUID businessId, String userId) {
        EntityState state = request.getState() != null ? EntityState.values()[request.getState()] : EntityState.DETACHED;
        PmDelivery entity;

        if (state == EntityState.ADDED) {
            entity = new PmDelivery();
            entity.setBusinessId(businessId);
            entity.setCreatedBy(userId);
            entity.setCreatedDate(Instant.now());
            entity.setIsDelete(false);
            mapRequestToEntity(request, entity);
            entity = deliveryRepository.save(entity);

            // ✅ Create initial document version
            documentVersionService.createVersion(
                    "DELIVERY",
                    entity.getId(),
                    entity.getProjectId(),
                    entity.getDeliveryCode(),
                    "v1.0",
                    "สร้างเอกสารส่งมอบงวดงาน (Initial delivery)"
            );

            // Save checklists
            if (request.getChecklists() != null) {
                for (PmDeliveryChecklistRequest chkReq : request.getChecklists()) {
                    PmDeliveryChecklist checklist = new PmDeliveryChecklist();
                    checklist.setCreatedBy(userId);
                    checklist.setCreatedDate(Instant.now());
                    checklist.setIsDelete(false);
                    checklist.setDeliveryId(entity.getId());
                    mapChecklistRequestToEntity(chkReq, checklist);
                    checklistRepository.save(checklist);
                }
            }
        } else if (state == EntityState.MODIFIED) {
            entity = deliveryRepository.findByIdAndBusinessIdAndIsDeleteFalse(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลการส่งมอบ"));

            // ✅ Auto Diff Detection
            List<String> changes = new ArrayList<>();
            DocumentDiffHelper.checkChange(changes, "ชื่องวดงาน (Title)", entity.getDeliveryTitle(), request.getDeliveryTitle());
            DocumentDiffHelper.checkChange(changes, "ประเภทการส่งมอบ (Type)", entity.getDeliveryType(), request.getDeliveryType());
            DocumentDiffHelper.checkChange(changes, "สถานะ (Status)", entity.getStatus(), request.getStatus());
            DocumentDiffHelper.checkChange(changes, "วันที่ส่งมอบ (Delivery Date)", entity.getDeliveryDate(), request.getDeliveryDate());
            DocumentDiffHelper.checkChange(changes, "Release Note", entity.getReleaseNote(), request.getReleaseNote());
            DocumentDiffHelper.checkChange(changes, "สรุปการส่งมอบ (Summary)", entity.getDeliverySummary(), request.getDeliverySummary());
            String diffSummary = DocumentDiffHelper.buildDiffSummary(changes, "อัปเดตเอกสารส่งมอบ " + (request.getDeliveryTitle() != null ? request.getDeliveryTitle() : entity.getDeliveryTitle()));

            mapRequestToEntity(request, entity);
            entity.setUpdatedBy(userId);
            entity.setUpdatedDate(Instant.now());
            entity = deliveryRepository.save(entity);

            // Snapshot data
            String snapshotJson = null;
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                snapshotJson = mapper.writeValueAsString(entity);
            } catch (Exception ignored) {}

            documentVersionService.createVersion(
                    "DELIVERY",
                    entity.getId(),
                    entity.getProjectId(),
                    entity.getDeliveryCode(),
                    "v1.1",
                    diffSummary,
                    snapshotJson
            );

            // Sync checklists
            if (request.getChecklists() != null) {
                for (PmDeliveryChecklistRequest chkReq : request.getChecklists()) {
                    EntityState chkState = chkReq.getState() != null ? EntityState.values()[chkReq.getState()] : EntityState.DETACHED;
                    if (chkState == EntityState.ADDED) {
                        PmDeliveryChecklist checklist = new PmDeliveryChecklist();
                        checklist.setCreatedBy(userId);
                        checklist.setCreatedDate(Instant.now());
                        checklist.setIsDelete(false);
                        checklist.setDeliveryId(entity.getId());
                        mapChecklistRequestToEntity(chkReq, checklist);
                        checklistRepository.save(checklist);
                    } else if (chkState == EntityState.MODIFIED) {
                        checklistRepository.findById(chkReq.getId()).ifPresent(chk -> {
                            mapChecklistRequestToEntity(chkReq, chk);
                            chk.setUpdatedBy(userId);
                            chk.setUpdatedDate(Instant.now());
                            checklistRepository.save(chk);
                        });
                    } else if (chkState == EntityState.DELETED) {
                        checklistRepository.findById(chkReq.getId()).ifPresent(chk -> {
                            chk.setIsDelete(true);
                            chk.setDeleteBy(userId);
                            chk.setDeleteDate(Instant.now());
                            checklistRepository.save(chk);
                        });
                    }
                }
            }
        } else {
            throw new IllegalArgumentException("Unsupported state: " + state);
        }

        return entity.getId();
    }

    @Override
    @Transactional
    public void delete(UUID id, UUID businessId, String userId) {
        PmDelivery delivery = deliveryRepository.findByIdAndBusinessIdAndIsDeleteFalse(id, businessId)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลการส่งมอบ"));
        delivery.setIsDelete(true);
        delivery.setDeleteBy(userId);
        delivery.setDeleteDate(Instant.now());
        deliveryRepository.save(delivery);
    }

    @Override
    @Transactional(readOnly = true)
    public PmDeliveryGateCheckResponse gateCheck(UUID deliveryId, UUID projectId, UUID businessId) {
        List<PmDeliveryGateCheckResponse.GateCheckItem> items = new ArrayList<>();
        int passedCount = 0;

        // 1. Check Requirements Confirmation / Approval
        List<PmRequirement> requirements = requirementRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(businessId, projectId);
        long totalReqs = requirements.size();
        long confirmedReqs = requirements.stream()
                .filter(req -> "Approved".equalsIgnoreCase(req.getStatus()) || approvalService.isApproved("REQUIREMENT", req.getId()))
                .count();
        boolean reqPassed = totalReqs > 0 && totalReqs == confirmedReqs;
        if (reqPassed) passedCount++;
        items.add(PmDeliveryGateCheckResponse.GateCheckItem.builder()
                .category("REQUIREMENT")
                .name("Requirement Confirmation Gate")
                .passed(reqPassed)
                .status(reqPassed ? "OK" : "ERROR")
                .detail(String.format("อนุมัติแล้ว %d จาก %d รายการ", confirmedReqs, totalReqs))
                .build());

        // 2. Check Specifications Confirmation / Approval
        List<PmSpecification> specifications = specificationRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(businessId, projectId);
        long totalSpecs = specifications.size();
        long confirmedSpecs = specifications.stream()
                .filter(spec -> "Approved".equalsIgnoreCase(spec.getStatus()) || approvalService.isApproved("SPECIFICATION", spec.getId()))
                .count();
        boolean specPassed = totalSpecs > 0 && totalSpecs == confirmedSpecs;
        if (specPassed) passedCount++;
        items.add(PmDeliveryGateCheckResponse.GateCheckItem.builder()
                .category("SPECIFICATION")
                .name("Specification Approval Gate")
                .passed(specPassed)
                .status(specPassed ? "OK" : "ERROR")
                .detail(String.format("อนุมัติแล้ว %d จาก %d รายการ", confirmedSpecs, totalSpecs))
                .build());

        // 3. Check Critical/High Bugs
        long criticalBugs = bugRepository.countByProjectIdAndSeverityInAndStatusNotAndIsDeleteFalse(projectId, List.of("Critical", "High"), "Closed");
        boolean bugPassed = criticalBugs == 0;
        if (bugPassed) passedCount++;
        items.add(PmDeliveryGateCheckResponse.GateCheckItem.builder()
                .category("BUG")
                .name("Critical/High Bug Closure Gate")
                .passed(bugPassed)
                .status(bugPassed ? "OK" : "ERROR")
                .detail(bugPassed ? "ไม่มี Critical/High Bug ที่ค้างอยู่" : String.format("มี Critical/High Bug ที่ยังไม่ปิด %d รายการ", criticalBugs))
                .build());

        // 4. Check Test Cases
        long totalTests = testCaseRepository.countByProjectIdAndIsDeleteFalse(projectId);
        long passedTests = testCaseRepository.countByProjectIdAndTestStatusAndIsDeleteFalse(projectId, "PASS");
        boolean testPassed = totalTests > 0 && totalTests == passedTests;
        if (testPassed) passedCount++;
        items.add(PmDeliveryGateCheckResponse.GateCheckItem.builder()
                .category("TEST")
                .name("Test Cases Execution Gate")
                .passed(testPassed)
                .status(testPassed ? "OK" : (passedTests > 0 ? "WARNING" : "ERROR"))
                .detail(String.format("ผ่านการทดสอบ %d จาก %d รายการ", passedTests, totalTests))
                .build());

        // 5. Checklist items (if deliveryId provided)
        if (deliveryId != null) {
            List<PmDeliveryChecklist> checklists = checklistRepository.findByDeliveryIdAndIsDeleteFalseOrderBySortOrderAsc(deliveryId);
            long checkedCount = checklists.stream().filter(PmDeliveryChecklist::getIsChecked).count();
            boolean chkPassed = !checklists.isEmpty() && checkedCount == checklists.size();
            if (chkPassed) passedCount++;
            items.add(PmDeliveryGateCheckResponse.GateCheckItem.builder()
                    .category("CHECKLIST")
                    .name("Delivery Checklist Items")
                    .passed(chkPassed)
                    .status(chkPassed ? "OK" : "WARNING")
                    .detail(String.format("ตรวจสอบแล้ว %d จาก %d รายการ", checkedCount, checklists.size()))
                    .build());
        }

        int totalChecks = items.size();
        boolean allPassed = passedCount == totalChecks;

        return PmDeliveryGateCheckResponse.builder()
                .isPassed(allPassed)
                .totalChecks(totalChecks)
                .passedChecks(passedCount)
                .checkItems(items)
                .build();
    }

    private void mapRequestToEntity(PmDeliveryRequest req, PmDelivery entity) {
        entity.setProjectId(req.getProjectId());
        entity.setDeliveryCode(req.getDeliveryCode());
        entity.setDeliveryTitle(req.getDeliveryTitle());
        entity.setDeliveryType(req.getDeliveryType() != null ? req.getDeliveryType() : "FINAL");
        entity.setContractId(req.getContractId());
        entity.setMilestoneId(req.getMilestoneId());
        entity.setDeliveryDate(req.getDeliveryDate());
        entity.setDeliveryVersion(req.getDeliveryVersion() != null ? req.getDeliveryVersion() : "1.0");
        entity.setReleaseNote(req.getReleaseNote());
        entity.setDeliverySummary(req.getDeliverySummary());
        entity.setStatus(req.getStatus() != null ? req.getStatus() : "DRAFT");
        entity.setPmApprovedBy(req.getPmApprovedBy());
        entity.setPmApprovedDate(req.getPmApprovedDate());
        entity.setCustomerSignedBy(req.getCustomerSignedBy());
        entity.setCustomerSignedDate(req.getCustomerSignedDate());
        entity.setAttachmentGroupId(req.getAttachmentGroupId());
    }

    private void mapChecklistRequestToEntity(PmDeliveryChecklistRequest req, PmDeliveryChecklist entity) {
        entity.setItemName(req.getItemName());
        entity.setItemCategory(req.getItemCategory());
        entity.setIsChecked(req.getIsChecked() != null ? req.getIsChecked() : false);
        entity.setCheckedBy(req.getCheckedBy());
        entity.setCheckedDate(req.getCheckedDate());
        entity.setRemark(req.getRemark());
        entity.setSortOrder(req.getSortOrder() != null ? req.getSortOrder() : 0);
    }

    private PmDeliveryResponse toResponse(PmDelivery entity) {
        PmDeliveryResponse res = new PmDeliveryResponse();
        res.setId(entity.getId());
        res.setBusinessId(entity.getBusinessId());
        res.setProjectId(entity.getProjectId());
        res.setDeliveryCode(entity.getDeliveryCode());
        res.setDeliveryTitle(entity.getDeliveryTitle());
        res.setDeliveryType(entity.getDeliveryType());
        res.setContractId(entity.getContractId());
        res.setMilestoneId(entity.getMilestoneId());
        res.setDeliveryDate(entity.getDeliveryDate());
        res.setDeliveryVersion(entity.getDeliveryVersion());
        res.setReleaseNote(entity.getReleaseNote());
        res.setDeliverySummary(entity.getDeliverySummary());
        res.setStatus(entity.getStatus());
        res.setPmApprovedBy(entity.getPmApprovedBy());
        res.setPmApprovedDate(entity.getPmApprovedDate());
        res.setCustomerSignedBy(entity.getCustomerSignedBy());
        res.setCustomerSignedDate(entity.getCustomerSignedDate());
        res.setAttachmentGroupId(entity.getAttachmentGroupId());
        res.setCreatedBy(entity.getCreatedBy());
        res.setCreatedDate(entity.getCreatedDate());
        res.setUpdatedBy(entity.getUpdatedBy());
        res.setUpdatedDate(entity.getUpdatedDate());
        res.setRowVersion(entity.getRowVersion());
        return res;
    }

    private PmDeliveryChecklistResponse toChecklistResponse(PmDeliveryChecklist entity) {
        PmDeliveryChecklistResponse res = new PmDeliveryChecklistResponse();
        res.setId(entity.getId());
        res.setDeliveryId(entity.getDeliveryId());
        res.setItemName(entity.getItemName());
        res.setItemCategory(entity.getItemCategory());
        res.setIsChecked(entity.getIsChecked());
        res.setCheckedBy(entity.getCheckedBy());
        res.setCheckedDate(entity.getCheckedDate());
        res.setRemark(entity.getRemark());
        res.setSortOrder(entity.getSortOrder());
        res.setRowVersion(entity.getRowVersion());
        return res;
    }
}
