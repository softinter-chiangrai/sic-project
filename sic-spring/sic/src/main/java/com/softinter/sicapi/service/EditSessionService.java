package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.response.EditSessionResponse;

import java.util.UUID;

public interface EditSessionService {
    EditSessionResponse createEditSession(UUID changeRequestId, String targetType, UUID targetId, String assigneeId);
    EditSessionResponse getActiveEditSession(String targetType, UUID targetId);
    void closeEditSession(String targetType, UUID targetId);
    boolean isDocumentLocked(String targetType, UUID targetId);
    boolean canEdit(String targetType, UUID targetId, String userId);
}