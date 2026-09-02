package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.PmDeliveryChecklistRequest;
import com.softinter.sicapi.dto.request.PmDeliveryItemRequest;
import com.softinter.sicapi.dto.request.PmDeliveryRequest;
import com.softinter.sicapi.dto.request.PmInvoiceRequest;
import com.softinter.sicapi.dto.response.PmDeliveryChecklistResponse;
import com.softinter.sicapi.dto.response.PmDeliveryGateCheckResponse;
import com.softinter.sicapi.dto.response.PmDeliveryItemResponse;
import com.softinter.sicapi.dto.response.PmDeliveryResponse;
import com.softinter.sicapi.entity.enums.BillingType;
import com.softinter.sicapi.entity.enums.EntityState;
import com.softinter.sicapi.entity.enums.PaymentStatus;
import com.softinter.sicapi.entity.pm.*;
import com.softinter.sicapi.repository.pm.*;
import com.softinter.sicapi.service.ApprovalService;
import com.softinter.sicapi.service.DocumentVersionService;
import com.softinter.sicapi.service.PmDeliveryService;
import com.softinter.sicapi.service.PmInvoiceService;
import com.softinter.sicapi.service.AuditLogService;
import com.softinter.sicapi.util.DocumentDiffHelper;
import com.softinter.sicapi.util.JsonSnapshotHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
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
    private final PmDeliveryItemRepository deliveryItemRepository;
    private final PmRequirementRepository requirementRepository;
    private final PmSpecificationRepository specificationRepository;
    private final PmBugRepository bugRepository;
    private final PmTestCaseRepository testCaseRepository;
    private final PmUserManualRepository userManualRepository;
    private final PmChangeRequestRepository changeRequestRepository;
    private final PmCustomerProjectRepository projectRepository;
    private final PmCustomerContractRepository contractRepository;

    private final ApprovalService approvalService;
    private final DocumentVersionService documentVersionService;
    private final PmInvoiceService invoiceService;
    private final AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public Page<PmDeliveryResponse> findAll(UUID businessId, UUID projectId, Pageable pageable) {
        Page<PmDelivery> page;
        if (projectId != null) {
            page = deliveryRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(businessId, projectId, pageable);
        } else {
            page = deliveryRepository.findByBusinessIdAndIsDeleteFalse(businessId, pageable);
        }
        return page.map(d -> toResponseWithReadiness(d, businessId));
    }

    @Override
    @Transactional(readOnly = true)
    public PmDeliveryResponse findById(UUID id, UUID businessId) {
        PmDelivery delivery = deliveryRepository.findByIdAndBusinessIdAndIsDeleteFalse(id, businessId)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลการส่งมอบ"));
        PmDeliveryResponse response = toResponseWithReadiness(delivery, businessId);
        
        List<PmDeliveryChecklistResponse> checklists = checklistRepository
                .findByDeliveryIdAndIsDeleteFalseOrderBySortOrderAsc(delivery.getId())
                .stream()
                .map(this::toChecklistResponse)
                .collect(Collectors.toList());
        response.setChecklists(checklists);

        List<PmDeliveryItemResponse> items = deliveryItemRepository
                .findByDeliveryIdAndIsDeleteFalseOrderBySortOrderAsc(delivery.getId())
                .stream()
                .map(this::toItemResponse)
                .collect(Collectors.toList());
        response.setItems(items);

        return response;
    }

    private PmDeliveryResponse toResponseWithReadiness(PmDelivery delivery, UUID businessId) {
        PmDeliveryResponse res = toResponse(delivery);
        try {
            List<PmDeliveryChecklist> chks = checklistRepository.findByDeliveryIdAndIsDeleteFalseOrderBySortOrderAsc(delivery.getId());
            int total = chks.size();
            int passed = (int) chks.stream().filter(c -> Boolean.TRUE.equals(c.getIsChecked())).count();
            res.setTotalChecklistCount(total);
            res.setCheckedChecklistCount(passed);
            res.setIsChecklistPassed(total > 0 && total == passed);

            if (delivery.getProjectId() != null) {
                PmDeliveryGateCheckResponse gate = gateCheck(delivery.getId(), delivery.getProjectId(), businessId);
                res.setIsGatePassed(gate.isPassed());
                res.setPassedGateChecks(gate.getPassedChecks());
                res.setTotalGateChecks(gate.getTotalChecks());
            }
        } catch (Exception e) {
            log.warn("Failed to calculate gate check readiness for delivery {}: {}", delivery.getId(), e.getMessage());
            res.setIsGatePassed(false);
            res.setIsChecklistPassed(false);
        }
        return res;
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
            entity.setIsLocked(false);
            entity.setDeliveryVersion("0.1");
            mapRequestToEntity(request, entity);
            entity = deliveryRepository.save(entity);

            // Create initial document version
            documentVersionService.createVersion(
                    "DELIVERY",
                    entity.getId(),
                    entity.getProjectId(),
                    entity.getDeliveryCode(),
                    "v" + entity.getDeliveryVersion(),
                    "สร้างเอกสารส่งมอบงวดงาน (Initial delivery)",
                    JsonSnapshotHelper.toJson(toResponse(entity))
            );

            // Save checklists
            saveChecklists(entity.getId(), request.getChecklists(), userId);
            
            // Save linked items
            saveDeliveryItems(entity.getId(), request.getItems(), userId);

        } else if (state == EntityState.MODIFIED) {
            entity = deliveryRepository.findByIdAndBusinessIdAndIsDeleteFalse(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลการส่งมอบ"));

            // Phase 2: Lock validation
            if (Boolean.TRUE.equals(entity.getIsLocked()) && !Boolean.TRUE.equals(request.getIsLocked())) {
                // If attempting to edit a locked delivery without unlocking authorization
                log.warn("Attempt to modify locked delivery document: {}", entity.getDeliveryCode());
            }

            // Check if status moves to DELIVERED, ACCEPTED, or CONFIRMED -> Auto Lock & Snapshot
            boolean shouldLock = "DELIVERED".equalsIgnoreCase(request.getStatus()) 
                    || "CONFIRMED".equalsIgnoreCase(request.getStatus())
                    || "ACCEPTED".equalsIgnoreCase(request.getStatus())
                    || Boolean.TRUE.equals(request.getIsLocked());

            List<String> changes = new ArrayList<>();
            DocumentDiffHelper.checkChange(changes, "ชื่องวดงาน (Title)", entity.getDeliveryTitle(), request.getDeliveryTitle());
            DocumentDiffHelper.checkChange(changes, "ประเภทการส่งมอบ (Type)", entity.getDeliveryType(), request.getDeliveryType());
            DocumentDiffHelper.checkChange(changes, "สถานะ (Status)", entity.getStatus(), request.getStatus());
            DocumentDiffHelper.checkChange(changes, "วันที่ส่งมอบ (Delivery Date)", entity.getDeliveryDate(), request.getDeliveryDate());
            DocumentDiffHelper.checkChange(changes, "Release Note", entity.getReleaseNote(), request.getReleaseNote());
            DocumentDiffHelper.checkChange(changes, "สรุปการส่งมอบ (Summary)", entity.getDeliverySummary(), request.getDeliverySummary());
            String diffSummary = DocumentDiffHelper.buildDiffSummary(changes, "อัปเดตเอกสารส่งมอบ " + (request.getDeliveryTitle() != null ? request.getDeliveryTitle() : entity.getDeliveryTitle()));

            mapRequestToEntity(request, entity);
            if (shouldLock) {
                entity.setIsLocked(true);
            }
            entity.setUpdatedBy(userId);
            entity.setUpdatedDate(Instant.now());
            entity = deliveryRepository.save(entity);

            // Snapshot data for versioning
            String snapshotJson = JsonSnapshotHelper.toJson(toResponse(entity));

            String nextVersion = "v" + (entity.getDeliveryVersion() != null ? entity.getDeliveryVersion() : "0.1");
            documentVersionService.createVersion(
                    "DELIVERY",
                    entity.getId(),
                    entity.getProjectId(),
                    entity.getDeliveryCode(),
                    nextVersion,
                    diffSummary + (shouldLock ? " [LOCKED/FROZEN]" : ""),
                    snapshotJson
            );

            // Sync checklists & items
            saveChecklists(entity.getId(), request.getChecklists(), userId);
            saveDeliveryItems(entity.getId(), request.getItems(), userId);

        } else {
            throw new IllegalArgumentException("Unsupported state: " + state);
        }

        // Audit Log
        try {
            String action = (state == EntityState.ADDED) ? "CREATE_DELIVERY" : "UPDATE_DELIVERY";
            auditLogService.log(action, "Delivery Management",
                    action.replace("_", " ") + ": " + entity.getDeliveryTitle() + " (" + entity.getDeliveryCode() + ")",
                    "DELIVERY", entity.getId(), null, null, "Success", null);
        } catch (Exception e) {
            log.error("ผิดพลาด audit log delivery: {}", e.getMessage(), e);
        }

        return entity.getId();
    }

    private void saveChecklists(UUID deliveryId, List<PmDeliveryChecklistRequest> checklists, String userId) {
        if (checklists == null) return;
        for (PmDeliveryChecklistRequest chkReq : checklists) {
            EntityState chkState = chkReq.getState() != null ? EntityState.values()[chkReq.getState()] : EntityState.DETACHED;
            if (chkState == EntityState.ADDED || chkReq.getId() == null) {
                PmDeliveryChecklist checklist = new PmDeliveryChecklist();
                checklist.setCreatedBy(userId);
                checklist.setCreatedDate(Instant.now());
                checklist.setIsDelete(false);
                checklist.setDeliveryId(deliveryId);
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

    private void saveDeliveryItems(UUID deliveryId, List<PmDeliveryItemRequest> items, String userId) {
        if (items == null) return;
        for (PmDeliveryItemRequest itemReq : items) {
            EntityState itemState = itemReq.getState() != null ? EntityState.values()[itemReq.getState()] : EntityState.DETACHED;
            if (itemState == EntityState.ADDED || itemReq.getId() == null) {
                PmDeliveryItem item = new PmDeliveryItem();
                item.setCreatedBy(userId);
                item.setCreatedDate(Instant.now());
                item.setIsDelete(false);
                item.setDeliveryId(deliveryId);
                mapItemRequestToEntity(itemReq, item);
                deliveryItemRepository.save(item);
            } else if (itemState == EntityState.MODIFIED) {
                deliveryItemRepository.findById(itemReq.getId()).ifPresent(item -> {
                    mapItemRequestToEntity(itemReq, item);
                    item.setUpdatedBy(userId);
                    item.setUpdatedDate(Instant.now());
                    deliveryItemRepository.save(item);
                });
            } else if (itemState == EntityState.DELETED) {
                deliveryItemRepository.findById(itemReq.getId()).ifPresent(item -> {
                    item.setIsDelete(true);
                    item.setDeleteBy(userId);
                    item.setDeleteDate(Instant.now());
                    deliveryItemRepository.save(item);
                });
            }
        }
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

        // 1. Check Requirements Confirmation
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

        // 2. Check Specifications Approval
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
        long totalTests = 0;
        long passedTests = 0;
        if (projectId != null) {
            totalTests = testCaseRepository.countByBusinessIdAndProjectIdAndIsDeleteFalse(businessId, projectId);
            passedTests = testCaseRepository.countByBusinessIdAndProjectIdAndTestStatusIgnoreCaseAndIsDeleteFalse(businessId, projectId, "PASS");
        }
        boolean testPassed = totalTests > 0 && totalTests == passedTests;
        if (testPassed) passedCount++;
        items.add(PmDeliveryGateCheckResponse.GateCheckItem.builder()
                .category("TEST")
                .name("Test Cases Execution Gate")
                .passed(testPassed)
                .status(testPassed ? "OK" : (passedTests > 0 ? "WARNING" : "ERROR"))
                .detail(String.format("ผ่านการทดสอบ %d จาก %d รายการ", passedTests, totalTests))
                .build());

        // 5. Check User Manuals
        List<PmUserManual> manuals = userManualRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(businessId, projectId);
        boolean manualPassed = !manuals.isEmpty() && manuals.stream().anyMatch(m -> "PUBLISHED".equalsIgnoreCase(m.getStatus()) || "APPROVED".equalsIgnoreCase(m.getStatus()));
        if (manualPassed) passedCount++;
        items.add(PmDeliveryGateCheckResponse.GateCheckItem.builder()
                .category("MANUAL")
                .name("User Manual Preparation Gate")
                .passed(manualPassed)
                .status(manualPassed ? "OK" : "WARNING")
                .detail(manualPassed ? String.format("มีคู่มือพร้อมส่งมอบ %d เล่ม", manuals.size()) : "ยังไม่มีคู่มือที่พร้อมส่งมอบ")
                .build());

        // 6. Check Linked Delivery Items & Checklists
        if (deliveryId != null) {
            List<PmDeliveryChecklist> checklists = checklistRepository.findByDeliveryIdAndIsDeleteFalseOrderBySortOrderAsc(deliveryId);
            long checkedCount = checklists.stream().filter(PmDeliveryChecklist::getIsChecked).count();
            boolean chkPassed = !checklists.isEmpty() && checkedCount == checklists.size();
            if (chkPassed) passedCount++;
            items.add(PmDeliveryGateCheckResponse.GateCheckItem.builder()
                    .category("CHECKLIST")
                    .name("Delivery Checklist Verification")
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

    @Override
    @Transactional
    public PmDeliveryResponse signOff(UUID deliveryId, String signedBy, UUID businessId, String userId) {
        PmDelivery delivery = deliveryRepository.findByIdAndBusinessIdAndIsDeleteFalse(deliveryId, businessId)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลการส่งมอบ"));

        delivery.setCustomerSignedBy(signedBy);
        delivery.setCustomerSignedDate(Instant.now());
        delivery.setStatus("ACCEPTED");
        delivery.setIsLocked(true);
        delivery.setUpdatedBy(userId);
        delivery.setUpdatedDate(Instant.now());
        delivery = deliveryRepository.save(delivery);

        // Snapshot sign-off
        documentVersionService.createVersion(
                "DELIVERY",
                delivery.getId(),
                delivery.getProjectId(),
                delivery.getDeliveryCode(),
                "v" + delivery.getDeliveryVersion() + "-ACCEPTED",
                "ลูกค้าลงนามตรวจรับงานเรียบร้อยโดย " + signedBy
        );

        return toResponse(delivery);
    }

    @Override
    @Transactional
    public UUID createInvoiceFromDelivery(UUID deliveryId, UUID businessId, String userId) {
        PmDelivery delivery = deliveryRepository.findByIdAndBusinessIdAndIsDeleteFalse(deliveryId, businessId)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลการส่งมอบ"));

        // Fetch customer from project
        UUID customerId = null;
        if (delivery.getProjectId() != null) {
            var projectOpt = projectRepository.findById(delivery.getProjectId());
            if (projectOpt.isPresent()) {
                customerId = projectOpt.get().getCustomerId();
            }
        }

        // Look for contract amount or default
        BigDecimal subtotal = BigDecimal.ZERO;
        if (delivery.getContractId() != null) {
            var contractOpt = contractRepository.findById(delivery.getContractId());
            if (contractOpt.isPresent() && contractOpt.get().getContractValue() != null) {
                subtotal = contractOpt.get().getContractValue();
            }
        }

        PmInvoiceRequest invReq = new PmInvoiceRequest();
        invReq.setInvoiceNo("INV-DEL-" + delivery.getDeliveryCode());
        invReq.setCustomerId(customerId);
        invReq.setProjectId(delivery.getProjectId());
        invReq.setContractId(delivery.getContractId());
        invReq.setDeliveryId(delivery.getId());
        invReq.setMilestoneId(delivery.getMilestoneId());
        invReq.setBillingType(BillingType.MILESTONE);
        invReq.setIssueDate(Instant.now());
        invReq.setDueDate(Instant.now().plus(java.time.Duration.ofDays(30)));
        invReq.setSubtotalAmount(subtotal);
        invReq.setPaymentStatus(PaymentStatus.UNPAID);
        invReq.setRemark("Generated from Delivery Acceptance: " + delivery.getDeliveryTitle() + " (" + delivery.getDeliveryCode() + ")");
        invReq.setState(EntityState.ADDED.ordinal());

        UUID invoiceId = invoiceService.save(invReq, businessId, userId);
        log.info("Successfully generated Invoice {} from Delivery {}", invoiceId, deliveryId);
        return invoiceId;
    }

    private void mapRequestToEntity(PmDeliveryRequest req, PmDelivery entity) {
        entity.setProjectId(req.getProjectId());
        entity.setDeliveryCode(req.getDeliveryCode());
        entity.setDeliveryTitle(req.getDeliveryTitle());
        entity.setDeliveryType(req.getDeliveryType() != null ? req.getDeliveryType() : "FINAL");
        entity.setContractId(req.getContractId());
        entity.setMilestoneId(req.getMilestoneId());
        entity.setDeliveryDate(req.getDeliveryDate());
        entity.setDeliveryVersion(req.getDeliveryVersion() != null ? req.getDeliveryVersion() : "0.1");
        entity.setReleaseNote(req.getReleaseNote());
        entity.setDeliverySummary(req.getDeliverySummary());
        entity.setStatus(req.getStatus() != null ? req.getStatus() : "DRAFT");
        entity.setPmApprovedBy(req.getPmApprovedBy());
        entity.setPmApprovedDate(req.getPmApprovedDate());
        entity.setCustomerSignedBy(req.getCustomerSignedBy());
        entity.setCustomerSignedDate(req.getCustomerSignedDate());
        entity.setAttachmentGroupId(req.getAttachmentGroupId());
        if (req.getIsLocked() != null) {
            entity.setIsLocked(req.getIsLocked());
        }
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

    private void mapItemRequestToEntity(PmDeliveryItemRequest req, PmDeliveryItem entity) {
        entity.setItemType(req.getItemType());
        entity.setItemId(req.getItemId());
        entity.setItemCode(req.getItemCode());
        entity.setItemTitle(req.getItemTitle());
        entity.setItemStatus(req.getItemStatus());
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
        res.setIsLocked(entity.getIsLocked());
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

    private PmDeliveryItemResponse toItemResponse(PmDeliveryItem entity) {
        PmDeliveryItemResponse res = new PmDeliveryItemResponse();
        res.setId(entity.getId());
        res.setDeliveryId(entity.getDeliveryId());
        res.setItemType(entity.getItemType());
        res.setItemId(entity.getItemId());
        res.setItemCode(entity.getItemCode());
        res.setItemTitle(entity.getItemTitle());
        res.setItemStatus(entity.getItemStatus());
        res.setRemark(entity.getRemark());
        res.setSortOrder(entity.getSortOrder());
        return res;
    }
}
