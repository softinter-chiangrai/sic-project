package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.AuditLogRequest;
import com.softinter.sicapi.dto.response.AuditLogResponse;
import org.springframework.data.domain.Page;

import java.util.UUID;

public interface AuditLogService {
    void logAsync(AuditLogRequest request);

    void log(String action, String module, String description, String status, String details);

    void log(String action, String module, String description, String targetType, UUID targetId, String oldValue, String newValue, String status, String details);

    Page<AuditLogResponse> getLogs(String searchTerm, String module, String status, String username, int page, int size, String sortBy, String sortDir);
}
