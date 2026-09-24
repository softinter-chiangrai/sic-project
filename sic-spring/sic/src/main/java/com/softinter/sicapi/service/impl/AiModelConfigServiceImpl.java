package com.softinter.sicapi.service.impl;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.dto.request.SaveAiModelConfigRequest;
import com.softinter.sicapi.dto.response.AiModelConfigResponse;
import com.softinter.sicapi.entity.db.DbAiModelConfig;
import com.softinter.sicapi.repository.db.DbAiModelConfigRepository;
import com.softinter.sicapi.service.AiModelConfigService;
import com.softinter.sicapi.service.CurrentUserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AiModelConfigServiceImpl implements AiModelConfigService {

    private final DbAiModelConfigRepository repository;
    private final CurrentUserService currentUserService;

    @Override
    public List<AiModelConfigResponse> getAll() {
        return repository.findByIsDeleteFalseOrderBySortOrderAsc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AiModelConfigResponse getById(UUID id) {
        DbAiModelConfig entity = repository.findById(id)
                .filter(e -> !Boolean.TRUE.equals(e.getIsDelete()))
                .orElseThrow(() -> new IllegalArgumentException("AI model config not found: " + id));
        return toResponse(entity);
    }

    @Override
    @Transactional
    public AiModelConfigResponse save(SaveAiModelConfigRequest request) {
        if (request.getModelCode() == null || request.getModelCode().isBlank()) {
            throw new IllegalArgumentException("modelCode is required");
        }
        if (request.getApiFormat() == null
                || !(request.getApiFormat().equals("CLAUDE") || request.getApiFormat().equals("OPENAI_COMPATIBLE"))) {
            throw new IllegalArgumentException("apiFormat must be CLAUDE or OPENAI_COMPATIBLE");
        }

        DbAiModelConfig entity;
        boolean isNew = request.getId() == null;

        if (isNew) {
            if (repository.existsByModelCodeAndIsDeleteFalse(request.getModelCode().trim())) {
                throw new IllegalStateException("modelCode already exists: " + request.getModelCode());
            }
            if (request.getApiKey() == null || request.getApiKey().isBlank()) {
                throw new IllegalArgumentException("apiKey is required when creating a new model");
            }
            entity = new DbAiModelConfig();
        } else {
            entity = repository.findById(request.getId())
                    .filter(e -> !Boolean.TRUE.equals(e.getIsDelete()))
                    .orElseThrow(() -> new IllegalArgumentException("AI model config not found: " + request.getId()));

            if (repository.existsByModelCodeAndIsDeleteFalseAndIdNot(request.getModelCode().trim(), entity.getId())) {
                throw new IllegalStateException("modelCode already exists: " + request.getModelCode());
            }
            if (request.getRowVersion() != null) {
                entity.setRowVersion(request.getRowVersion());
            }
        }

        entity.setModelCode(request.getModelCode().trim());
        entity.setDisplayName(request.getDisplayName());
        entity.setProviderLabel(request.getProviderLabel());
        entity.setApiFormat(request.getApiFormat());
        entity.setApiUrl(request.getApiUrl());
        entity.setMaxTokens(request.getMaxTokens() != null ? request.getMaxTokens() : 4096);
        entity.setDescription(request.getDescription());
        entity.setIcon(request.getIcon());
        entity.setIsRecommended(Boolean.TRUE.equals(request.getIsRecommended()));
        entity.setIsActive(request.getIsActive() == null || request.getIsActive());
        entity.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 1);

        // เว้นว่าง apiKey ตอนแก้ไข = ไม่เปลี่ยน key เดิม
        if (request.getApiKey() != null && !request.getApiKey().isBlank()) {
            entity.setApiKey(request.getApiKey().trim());
        }

        boolean wantsDefault = Boolean.TRUE.equals(request.getIsDefault());
        entity.setIsDefault(wantsDefault);
        entity = repository.save(entity);

        if (wantsDefault) {
            unsetOtherDefaults(entity.getId());
        }

        return toResponse(entity);
    }

    private void unsetOtherDefaults(UUID keepId) {
        repository.findByIsDeleteFalseOrderBySortOrderAsc().stream()
                .filter(e -> !e.getId().equals(keepId) && Boolean.TRUE.equals(e.getIsDefault()))
                .forEach(e -> {
                    e.setIsDefault(false);
                    repository.save(e);
                });
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        DbAiModelConfig entity = repository.findById(id)
                .filter(e -> !Boolean.TRUE.equals(e.getIsDelete()))
                .orElseThrow(() -> new IllegalArgumentException("AI model config not found: " + id));

        entity.setIsDelete(true);
        entity.setDeleteBy(currentUserService.getUserId());
        entity.setDeleteDate(Instant.now());
        repository.save(entity);
    }

    private AiModelConfigResponse toResponse(DbAiModelConfig e) {
        return AiModelConfigResponse.builder()
                .id(e.getId())
                .modelCode(e.getModelCode())
                .displayName(e.getDisplayName())
                .providerLabel(e.getProviderLabel())
                .apiFormat(e.getApiFormat())
                .apiUrl(e.getApiUrl())
                .apiKeyMasked(maskKey(e.getApiKey()))
                .hasApiKey(e.getApiKey() != null && !e.getApiKey().isBlank())
                .maxTokens(e.getMaxTokens())
                .description(e.getDescription())
                .icon(e.getIcon())
                .isRecommended(Boolean.TRUE.equals(e.getIsRecommended()))
                .isDefault(Boolean.TRUE.equals(e.getIsDefault()))
                .isActive(Boolean.TRUE.equals(e.getIsActive()))
                .sortOrder(e.getSortOrder())
                .rowVersion(e.getRowVersion())
                .updatedDate(e.getUpdatedDate())
                .build();
    }

    private String maskKey(String apiKey) {
        if (apiKey == null || apiKey.isBlank()) {
            return null;
        }
        String trimmed = apiKey.trim();
        if (trimmed.length() <= 4) {
            return "****";
        }
        return "****" + trimmed.substring(trimmed.length() - 4);
    }
}
