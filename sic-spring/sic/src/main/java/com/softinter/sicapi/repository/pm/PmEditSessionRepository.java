package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmEditSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PmEditSessionRepository extends JpaRepository<PmEditSession, UUID> {
    Optional<PmEditSession> findByTargetTypeAndTargetIdAndIsActiveTrue(String targetType, UUID targetId);
    @Query("SELECT es FROM PmEditSession es WHERE es.targetType = :targetType AND es.targetId = :targetId AND es.isActive = true AND (es.expiresAt IS NULL OR es.expiresAt > CURRENT_TIMESTAMP)")
    Optional<PmEditSession> findActiveByTarget(@Param("targetType") String targetType, @Param("targetId") UUID targetId);
}