package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.response.EditSessionResponse;
import com.softinter.sicapi.entity.pm.PmEditSession;
import com.softinter.sicapi.repository.pm.PmEditSessionRepository;
import com.softinter.sicapi.service.EditSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EditSessionServiceImpl implements EditSessionService {

    private final PmEditSessionRepository editSessionRepository;

    @Override
    @Transactional
    public EditSessionResponse createEditSession(UUID changeRequestId, String targetType, UUID targetId, String assigneeId) {
        // ปิด session เดิมที่ยัง active อยู่
        closeEditSession(targetType, targetId);

        PmEditSession session = new PmEditSession();
        session.setChangeRequestId(changeRequestId);
        session.setTargetType(targetType);
        session.setTargetId(targetId);
        session.setAssigneeId(assigneeId);
        session.setGrantedAt(Instant.now());
        session.setExpiresAt(Instant.now().plusSeconds(7 * 24 * 60 * 60)); // 7 days
        session.setIsActive(true);
        session = editSessionRepository.save(session);
        return toResponse(session);
    }

    @Override
    public EditSessionResponse getActiveEditSession(String targetType, UUID targetId) {
        return editSessionRepository.findActiveByTarget(targetType, targetId)
                .map(this::toResponse)
                .orElse(null);
    }

    @Override
    @Transactional
    public void closeEditSession(String targetType, UUID targetId) {
        editSessionRepository.findActiveByTarget(targetType, targetId)
                .ifPresent(session -> {
                    session.setIsActive(false);
                    editSessionRepository.save(session);
                });
    }

    @Override
    public boolean isDocumentLocked(String targetType, UUID targetId) {
        return editSessionRepository.findActiveByTarget(targetType, targetId).isPresent();
    }

    @Override
    public boolean canEdit(String targetType, UUID targetId, String userId) {
        return editSessionRepository.findActiveByTarget(targetType, targetId)
                .map(session -> session.getAssigneeId().equals(userId))
                .orElse(true); // if no session, allow edit
    }

    private EditSessionResponse toResponse(PmEditSession session) {
        EditSessionResponse resp = new EditSessionResponse();
        resp.setId(session.getId());
        resp.setChangeRequestId(session.getChangeRequestId());
        resp.setTargetType(session.getTargetType());
        resp.setTargetId(session.getTargetId());
        resp.setAssigneeId(session.getAssigneeId());
        resp.setGrantedAt(session.getGrantedAt());
        resp.setExpiresAt(session.getExpiresAt());
        resp.setIsActive(session.getIsActive());
        return resp;
    }
}