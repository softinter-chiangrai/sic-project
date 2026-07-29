package com.softinter.sicapi.service.impl;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.softinter.sicapi.dto.request.PmSpecificationRequest;
import com.softinter.sicapi.dto.response.PmSpecificationResponse;
import com.softinter.sicapi.entity.enums.EntityState;
import com.softinter.sicapi.entity.enums.TraceRelationship;
import com.softinter.sicapi.entity.pm.PmSpecification;
import com.softinter.sicapi.entity.pm.PmSpecificationApi;
import com.softinter.sicapi.entity.pm.PmSpecificationBusinessRule;
import com.softinter.sicapi.entity.pm.PmSpecificationField;
import com.softinter.sicapi.entity.pm.PmSpecificationScreen;
import com.softinter.sicapi.entity.pm.PmSpecificationValidation;
import com.softinter.sicapi.entity.pm.PmSpecificationVersion;
import com.softinter.sicapi.entity.pm.PmTraceLink;
import com.softinter.sicapi.repository.pm.PmRequirementRepository;
import com.softinter.sicapi.repository.pm.PmSpecificationApiRepository;
import com.softinter.sicapi.repository.pm.PmSpecificationBusinessRuleRepository;
import com.softinter.sicapi.repository.pm.PmSpecificationFieldRepository;
import com.softinter.sicapi.repository.pm.PmSpecificationRepository;
import com.softinter.sicapi.repository.pm.PmSpecificationScreenRepository;
import com.softinter.sicapi.repository.pm.PmSpecificationValidationRepository;
import com.softinter.sicapi.repository.pm.PmSpecificationVersionRepository;
import com.softinter.sicapi.service.PmSpecificationService;
import com.softinter.sicapi.service.TraceLinkService;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PmSpecificationServiceImpl implements PmSpecificationService {

    private final PmSpecificationRepository specificationRepository;
    private final PmSpecificationScreenRepository screenRepository;
    private final PmSpecificationFieldRepository fieldRepository;
    private final PmSpecificationValidationRepository validationRepository;
    private final PmSpecificationBusinessRuleRepository businessRuleRepository;
    private final PmSpecificationApiRepository apiRepository;
    private final PmSpecificationVersionRepository versionRepository;
    private final TraceLinkService traceLinkService;
    private final PmRequirementRepository requirementRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<PmSpecificationResponse> findAll(UUID businessId, String keyword, String status, Pageable pageable) {
        Specification<PmSpecification> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("businessId"), businessId));
            predicates.add(cb.isFalse(root.get("isDelete")));

            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("specificationCode")), pattern),
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("module")), pattern)
                ));
            }

            if (status != null && !status.isBlank() && !"all".equals(status)) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return specificationRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PmSpecificationResponse findById(UUID id, UUID businessId) {
        PmSpecification spec = specificationRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new RuntimeException("ไม่พบ Specification"));
        return toResponse(spec);
    }

    @Override
    @Transactional
    public UUID save(PmSpecificationRequest request, UUID businessId, String userId) {
        PmSpecification spec;
        EntityState state = request.getState() != null ? EntityState.values()[request.getState()] : EntityState.DETACHED;

        if (state == EntityState.ADDED || request.getId() == null) {
            // Create new
            if (specificationRepository.existsByBusinessIdAndSpecificationCodeAndIsDeleteFalse(businessId, request.getSpecificationCode())) {
                throw new RuntimeException("รหัส Specification นี้มีอยู่แล้ว: " + request.getSpecificationCode());
            }

            spec = new PmSpecification();
            spec.setBusinessId(businessId);
            spec.setCreatedBy(userId);
            spec.setCreatedDate(Instant.now());
            spec.setIsDelete(false);
            spec.setVersion("1.0");
            spec.setStatus("Draft");
            mapRequestToEntity(request, spec);
            spec = specificationRepository.save(spec);

            // สร้าง Trace Links จาก Requirement
            if (request.getRequirements() != null) {
                for (PmSpecificationRequest.RequirementLinkDto req : request.getRequirements()) {
                    traceLinkService.createLink(
                            spec.getBusinessId(),
                            "REQUIREMENT", req.getRequirementId(),
                            "SPECIFICATION", spec.getId(),
                            TraceRelationship.DOCUMENTED_BY
                    );
                }
            }

            createVersionSnapshot(spec, "Initial version");

        } else if (state == EntityState.MODIFIED) {
            spec = specificationRepository.findByIdAndBusinessId(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("ไม่พบ Specification"));

            if (request.getRowVersion() != null && !request.getRowVersion().equals(spec.getRowVersion())) {
                throw new RuntimeException("ข้อมูลมีการเปลี่ยนแปลงโดยผู้อื่น กรุณารีเฟรชหน้าเว็บ");
            }

            String oldVersion = spec.getVersion();
            spec.setUpdatedBy(userId);
            spec.setUpdatedDate(Instant.now());
            mapRequestToEntity(request, spec);

            // จัดการ Trace Links
            updateRequirementLinks(spec, request.getRequirements());

            // Increment version if status changed to Approved or Released
            if ("Approved".equals(request.getStatus()) || "Released".equals(request.getStatus())) {
                spec.setVersion(incrementVersion(oldVersion));
                createVersionSnapshot(spec, "Status changed to " + request.getStatus());
            }

            spec = specificationRepository.save(spec);

        } else if (state == EntityState.DELETED) {
            spec = specificationRepository.findByIdAndBusinessId(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("ไม่พบ Specification"));
            spec.setIsDelete(true);
            spec.setDeleteBy(userId);
            spec.setDeleteDate(Instant.now());
            specificationRepository.save(spec);

            // Soft delete trace links ที่เกี่ยวข้อง
            deleteRequirementTraceLinks(spec.getId());

            return spec.getId();

        } else {
            throw new IllegalArgumentException("Invalid state: " + state);
        }

        // Save child data (screens, fields, etc.)
        if (state != EntityState.DELETED) {
            saveChildren(spec, request);
        }

        return spec.getId();
    }

    @Override
    @Transactional
    public void delete(UUID id, UUID businessId, String userId) {
        PmSpecification spec = specificationRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new RuntimeException("ไม่พบ Specification"));
        spec.setIsDelete(true);
        spec.setDeleteBy(userId);
        spec.setDeleteDate(Instant.now());
        specificationRepository.save(spec);

        // Soft delete trace links
        deleteRequirementTraceLinks(spec.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public PmSpecificationResponse getByCode(UUID businessId, String code) {
        PmSpecification spec = specificationRepository.findByBusinessIdAndSpecificationCode(businessId, code)
                .orElseThrow(() -> new RuntimeException("ไม่พบ Specification"));
        return toResponse(spec);
    }

    // ===== Private Methods =====

    private void mapRequestToEntity(PmSpecificationRequest request, PmSpecification entity) {
        entity.setSpecificationCode(request.getSpecificationCode());
        entity.setTitle(request.getTitle());
        entity.setModule(request.getModule());
        entity.setPriority(request.getPriority());
        entity.setOwner(request.getOwner());
        entity.setEstimatedManday(request.getEstimatedManday());
        entity.setObjective(request.getObjective());
        entity.setScope(request.getScope());
        entity.setDescription(request.getDescription());
        entity.setRemark(request.getRemark());
        entity.setUploadGroupId(request.getUploadGroupId());

        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }
        if (request.getVersion() != null) {
            entity.setVersion(request.getVersion());
        }
    }

    private void saveChildren(PmSpecification spec, PmSpecificationRequest request) {
        // Screens
        if (request.getScreens() != null) {
            screenRepository.deleteBySpecificationIdAndIsDeleteFalse(spec.getId());
            for (PmSpecificationRequest.ScreenDto dto : request.getScreens()) {
                PmSpecificationScreen screen = new PmSpecificationScreen();
                screen.setSpecification(spec);
                screen.setScreenName(dto.getScreenName());
                screen.setDescription(dto.getDescription());
                screen.setNavigation(dto.getNavigation());
                screen.setMockupUrl(dto.getMockupUrl());
                screen.setCreatedBy(spec.getCreatedBy());
                screen.setCreatedDate(Instant.now());
                screenRepository.save(screen);
            }
        }

        // Fields
        if (request.getFields() != null) {
            fieldRepository.deleteBySpecificationIdAndIsDeleteFalse(spec.getId());
            for (PmSpecificationRequest.FieldDto dto : request.getFields()) {
                PmSpecificationField field = new PmSpecificationField();
                field.setSpecification(spec);
                field.setFieldName(dto.getFieldName());
                field.setDataType(dto.getDataType());
                field.setIsRequired(dto.getIsRequired() != null ? dto.getIsRequired() : false);
                field.setMaxLength(dto.getMaxLength());
                field.setDefaultValue(dto.getDefaultValue());
                field.setDescription(dto.getDescription());
                field.setCreatedBy(spec.getCreatedBy());
                field.setCreatedDate(Instant.now());
                fieldRepository.save(field);
            }
        }

        // Validations
        if (request.getValidations() != null) {
            validationRepository.deleteBySpecificationIdAndIsDeleteFalse(spec.getId());
            for (PmSpecificationRequest.ValidationDto dto : request.getValidations()) {
                PmSpecificationValidation validation = new PmSpecificationValidation();
                validation.setSpecification(spec);
                validation.setValidationType(dto.getValidationType());
                validation.setRule(dto.getRule());
                validation.setErrorMessage(dto.getErrorMessage());
                validation.setCreatedBy(spec.getCreatedBy());
                validation.setCreatedDate(Instant.now());
                validationRepository.save(validation);
            }
        }

        // Business Rules
        if (request.getBusinessRules() != null) {
            businessRuleRepository.deleteBySpecificationIdAndIsDeleteFalse(spec.getId());
            for (PmSpecificationRequest.BusinessRuleDto dto : request.getBusinessRules()) {
                PmSpecificationBusinessRule rule = new PmSpecificationBusinessRule();
                rule.setSpecification(spec);
                rule.setRuleName(dto.getRuleName());
                rule.setDescription(dto.getDescription());
                rule.setSeverity(dto.getSeverity() != null ? dto.getSeverity() : "Medium");
                rule.setCreatedBy(spec.getCreatedBy());
                rule.setCreatedDate(Instant.now());
                businessRuleRepository.save(rule);
            }
        }

        // APIs
        if (request.getApis() != null) {
            apiRepository.deleteBySpecificationIdAndIsDeleteFalse(spec.getId());
            for (PmSpecificationRequest.ApiDto dto : request.getApis()) {
                PmSpecificationApi api = new PmSpecificationApi();
                api.setSpecification(spec);
                api.setHttpMethod(dto.getHttpMethod());
                api.setUrl(dto.getUrl());
                api.setRequestSchema(objectMapper.convertValue(dto.getRequestSchema(), Map.class));
                api.setResponseSchema(objectMapper.convertValue(dto.getResponseSchema(), Map.class));
                api.setAuthentication(dto.getAuthentication());
                api.setCreatedBy(spec.getCreatedBy());
                api.setCreatedDate(Instant.now());
                apiRepository.save(api);
            }
        }
    }

    // ===== จัดการ Requirement Trace Links =====

    private void updateRequirementLinks(PmSpecification spec, List<PmSpecificationRequest.RequirementLinkDto> newRequirements) {
        // 1. ดึง trace links ปัจจุบันที่ Target = SPECIFICATION และ SourceType = REQUIREMENT
        List<PmTraceLink> existingLinks = traceLinkService.getLinksByTarget("SPECIFICATION", spec.getId())
                .stream()
                .filter(link -> "REQUIREMENT".equals(link.getSourceType()))
                .collect(Collectors.toList());

        // 2. สร้าง Set ของ requirementId ที่มีอยู่แล้ว
        List<UUID> existingReqIds = existingLinks.stream()
                .map(PmTraceLink::getSourceId)
                .collect(Collectors.toList());

        // 3. กำหนด requirementIds ใหม่ (ถ้า null ให้เป็น empty list)
        List<UUID> newReqIds = (newRequirements != null)
                ? newRequirements.stream()
                    .map(PmSpecificationRequest.RequirementLinkDto::getRequirementId)
                    .collect(Collectors.toList())
                : new ArrayList<>();

        // 4. ลบ links ที่ไม่มีใน newReqIds
        for (PmTraceLink link : existingLinks) {
            if (!newReqIds.contains(link.getSourceId())) {
                traceLinkService.deleteLink(link.getId());
            }
        }

        // 5. เพิ่ม links ใหม่ที่ยังไม่มี
        for (UUID reqId : newReqIds) {
            if (!existingReqIds.contains(reqId)) {
                traceLinkService.createLink(
                        spec.getBusinessId(),
                        "REQUIREMENT", reqId,
                        "SPECIFICATION", spec.getId(),
                        TraceRelationship.DOCUMENTED_BY
                );
            }
        }
    }

    private void deleteRequirementTraceLinks(UUID specId) {
        List<PmTraceLink> links = traceLinkService.getLinksByTarget("SPECIFICATION", specId)
                .stream()
                .filter(link -> "REQUIREMENT".equals(link.getSourceType()))
                .collect(Collectors.toList());
        for (PmTraceLink link : links) {
            traceLinkService.deleteLink(link.getId());
        }
    }

    private void createVersionSnapshot(PmSpecification spec, String changeSummary) {
        try {
            PmSpecificationResponse response = toResponse(spec);
            Map<String, Object> dataMap = objectMapper.convertValue(response, Map.class);

            int versionNumber = versionRepository.findBySpecificationIdAndIsDeleteFalseOrderByVersionNumberDesc(spec.getId())
                    .stream().findFirst().map(v -> v.getVersionNumber() + 1).orElse(1);

            PmSpecificationVersion version = new PmSpecificationVersion();
            version.setSpecification(spec);
            version.setVersionNumber(versionNumber);
            version.setSpecificationData(dataMap);
            version.setChangeSummary(changeSummary);
            version.setChangedBy(spec.getUpdatedBy() != null ? spec.getUpdatedBy() : spec.getCreatedBy());
            version.setChangedDate(Instant.now());
            version.setCreatedBy(spec.getUpdatedBy() != null ? spec.getUpdatedBy() : spec.getCreatedBy());
            version.setCreatedDate(Instant.now());
            versionRepository.save(version);
        } catch (Exception e) {
            log.error("Failed to create version snapshot for spec: {}", spec.getId(), e);
        }
    }

    private String incrementVersion(String currentVersion) {
        try {
            String numPart = currentVersion;
            if (currentVersion.startsWith("v") || currentVersion.startsWith("V")) {
                numPart = currentVersion.substring(1);
            }
            double val = Double.parseDouble(numPart);
            val += 0.1;
            String newNum = String.format("%.1f", val);
            return (currentVersion.startsWith("v") || currentVersion.startsWith("V")) ? "v" + newNum : newNum;
        } catch (NumberFormatException e) {
            return "1.1";
        }
    }

    private PmSpecificationResponse toResponse(PmSpecification spec) {
        PmSpecificationResponse response = new PmSpecificationResponse();
        response.setId(spec.getId());
        response.setSpecificationCode(spec.getSpecificationCode());
        response.setTitle(spec.getTitle());
        response.setModule(spec.getModule());
        response.setVersion(spec.getVersion());
        response.setStatus(spec.getStatus());
        response.setPriority(spec.getPriority());
        response.setOwner(spec.getOwner());
        response.setEstimatedManday(spec.getEstimatedManday());
        response.setObjective(spec.getObjective());
        response.setScope(spec.getScope());
        response.setDescription(spec.getDescription());
        response.setRemark(spec.getRemark());
        response.setUploadGroupId(spec.getUploadGroupId());
        response.setIsAiGenerated(spec.getIsAiGenerated());
        response.setAiGeneratedAt(spec.getAiGeneratedAt());
        response.setGeneratedFromRequirementId(spec.getGeneratedFromRequirementId());
        response.setGeneratedFromDiagramId(spec.getGeneratedFromDiagramId());
        response.setRowVersion(spec.getRowVersion());
        response.setCreatedDate(spec.getCreatedDate());
        response.setUpdatedDate(spec.getUpdatedDate());

        // ✅ ดึง Requirement links จาก trace link
        List<PmTraceLink> traceLinks = traceLinkService.getLinksByTarget("SPECIFICATION", spec.getId())
                .stream()
                .filter(link -> "REQUIREMENT".equals(link.getSourceType()))
                .collect(Collectors.toList());

        List<PmSpecificationResponse.RequirementResponse> reqResponses = traceLinks.stream().map(link -> {
            UUID reqId = link.getSourceId();
            PmSpecificationResponse.RequirementResponse dto = new PmSpecificationResponse.RequirementResponse();
            dto.setRequirementId(reqId);
            requirementRepository.findById(reqId).ifPresent(req -> {
                dto.setRequirementCode(req.getRequirementCode());
                dto.setRequirementTitle(req.getTitle());
            });
            return dto;
        }).collect(Collectors.toList());

        response.setRequirements(reqResponses);

        // Screens
        List<PmSpecificationScreen> screens = screenRepository.findBySpecificationIdAndIsDeleteFalse(spec.getId());
        List<PmSpecificationResponse.ScreenResponse> screenResponses = screens.stream().map(s -> {
            PmSpecificationResponse.ScreenResponse dto = new PmSpecificationResponse.ScreenResponse();
            dto.setId(s.getId());
            dto.setScreenName(s.getScreenName());
            dto.setDescription(s.getDescription());
            dto.setNavigation(s.getNavigation());
            dto.setMockupUrl(s.getMockupUrl());
            return dto;
        }).collect(Collectors.toList());
        response.setScreens(screenResponses);

        // Fields
        List<PmSpecificationField> fields = fieldRepository.findBySpecificationIdAndIsDeleteFalse(spec.getId());
        List<PmSpecificationResponse.FieldResponse> fieldResponses = fields.stream().map(f -> {
            PmSpecificationResponse.FieldResponse dto = new PmSpecificationResponse.FieldResponse();
            dto.setId(f.getId());
            dto.setFieldName(f.getFieldName());
            dto.setDataType(f.getDataType());
            dto.setIsRequired(f.getIsRequired());
            dto.setMaxLength(f.getMaxLength());
            dto.setDefaultValue(f.getDefaultValue());
            dto.setDescription(f.getDescription());
            return dto;
        }).collect(Collectors.toList());
        response.setFields(fieldResponses);

        // Validations
        List<PmSpecificationValidation> validations = validationRepository.findBySpecificationIdAndIsDeleteFalse(spec.getId());
        List<PmSpecificationResponse.ValidationResponse> validationResponses = validations.stream().map(v -> {
            PmSpecificationResponse.ValidationResponse dto = new PmSpecificationResponse.ValidationResponse();
            dto.setId(v.getId());
            dto.setValidationType(v.getValidationType());
            dto.setRule(v.getRule());
            dto.setErrorMessage(v.getErrorMessage());
            return dto;
        }).collect(Collectors.toList());
        response.setValidations(validationResponses);

        // Business Rules
        List<PmSpecificationBusinessRule> rules = businessRuleRepository.findBySpecificationIdAndIsDeleteFalse(spec.getId());
        List<PmSpecificationResponse.BusinessRuleResponse> ruleResponses = rules.stream().map(r -> {
            PmSpecificationResponse.BusinessRuleResponse dto = new PmSpecificationResponse.BusinessRuleResponse();
            dto.setId(r.getId());
            dto.setRuleName(r.getRuleName());
            dto.setDescription(r.getDescription());
            dto.setSeverity(r.getSeverity());
            return dto;
        }).collect(Collectors.toList());
        response.setBusinessRules(ruleResponses);

        // APIs
        List<PmSpecificationApi> apis = apiRepository.findBySpecificationIdAndIsDeleteFalse(spec.getId());
        List<PmSpecificationResponse.ApiResponse> apiResponses = apis.stream().map(a -> {
            PmSpecificationResponse.ApiResponse dto = new PmSpecificationResponse.ApiResponse();
            dto.setId(a.getId());
            dto.setHttpMethod(a.getHttpMethod());
            dto.setUrl(a.getUrl());
            dto.setRequestSchema(a.getRequestSchema());
            dto.setResponseSchema(a.getResponseSchema());
            dto.setAuthentication(a.getAuthentication());
            return dto;
        }).collect(Collectors.toList());
        response.setApis(apiResponses);

        return response;
    }
}