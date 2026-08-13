package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.AuditLogRequest;
import com.softinter.sicapi.dto.response.AuditLogResponse;
import com.softinter.sicapi.entity.su.SuAuditLog;
import com.softinter.sicapi.repository.su.SuAuditLogRepository;
import com.softinter.sicapi.service.AuditLogService;
import com.softinter.sicapi.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final SuAuditLogRepository auditLogRepository;
    private final CurrentUserService currentUserService;

    @Override
    @Async
    @Transactional
    public void logAsync(AuditLogRequest request) {
        try {
            SuAuditLog entity = new SuAuditLog();
            entity.setUserId(request.getUserId());
            entity.setUsername(request.getUsername());
            entity.setUserFullname(request.getUserFullname() != null ? request.getUserFullname() : request.getUsername());
            entity.setAction(request.getAction());
            entity.setModule(request.getModule());
            entity.setDescription(request.getDescription());
            entity.setIpAddress(request.getIpAddress());
            entity.setStatus(request.getStatus() != null ? request.getStatus() : "Success");
            entity.setDetails(request.getDetails());
            entity.setBusinessId(request.getBusinessId());

            auditLogRepository.save(entity);
            log.debug("AuditLog saved: action={}, module={}, user={}", request.getAction(), request.getModule(), request.getUsername());
        } catch (Exception e) {
            log.error("Failed to save audit log: {}", e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void log(String action, String module, String description, String status, String details) {
        AuditLogRequest request = new AuditLogRequest();
        try {
            request.setUserId(currentUserService.getUserId());
        } catch (Exception e) {
            request.setUserId("system");
        }
        try {
            request.setUsername(currentUserService.getUsername());
        } catch (Exception e) {
            request.setUsername("system");
        }
        try {
            request.setUserFullname(currentUserService.getUsername());
        } catch (Exception e) {
            request.setUserFullname("system");
        }
        try {
            request.setIpAddress(currentUserService.getIpAddress());
        } catch (Exception e) {
            request.setIpAddress("unknown");
        }
        try {
            request.setBusinessId(currentUserService.getBusinessId());
        } catch (Exception e) {
            request.setBusinessId(null);
        }

        request.setAction(action);
        request.setModule(module);
        request.setDescription(description);
        request.setStatus(status != null ? status : "Success");
        request.setDetails(details);

        logAsync(request);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getLogs(String searchTerm, String module, String status, String username, int page, int size, String sortBy, String sortDir) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir != null ? sortDir : "DESC"), sortBy != null ? sortBy : "createdDate");
        Pageable pageable = PageRequest.of(page > 0 ? page - 1 : 0, size > 0 ? size : 10, sort);

        return auditLogRepository.searchLogs(searchTerm, module, status, username, pageable)
                .map(this::toResponse);
    }

    private AuditLogResponse toResponse(SuAuditLog entity) {
        AuditLogResponse response = new AuditLogResponse();
        response.setId(entity.getId());
        response.setUserId(entity.getUserId());
        response.setUsername(entity.getUsername());
        response.setUserFullname(entity.getUserFullname());
        response.setAction(entity.getAction());
        response.setModule(entity.getModule());
        response.setDescription(entity.getDescription());
        response.setIpAddress(entity.getIpAddress());
        response.setStatus(entity.getStatus());
        response.setDetails(entity.getDetails());
        response.setBusinessId(entity.getBusinessId());
        response.setCreatedDate(entity.getCreatedDate());
        response.setCreatedBy(entity.getCreatedBy());
        return response;
    }
}
