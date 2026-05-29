package com.softinter.sicapi.repository.su;

import com.softinter.sicapi.entity.su.SuBusinessAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SuBusinessAuditRepository extends JpaRepository<SuBusinessAudit, UUID> {

    @Query("SELECT ba FROM SuBusinessAudit ba WHERE ba.userId = :userId AND ba.sessionId = :sessionId AND ba.isActive = true ORDER BY ba.id DESC")
    List<SuBusinessAudit> findActiveByUserIdAndSessionId(@Param("userId") String userId, @Param("sessionId") String sessionId);

    @Query("SELECT ba.businessId FROM SuBusinessAudit ba WHERE ba.sessionId = :sessionId AND ba.userId = :userId AND ba.clientIp = :clientIp AND ba.businessId IN :businessIds ORDER BY ba.id DESC")
    List<UUID> findRecentBusinessIdBySession(@Param("sessionId") String sessionId, @Param("userId") String userId, @Param("clientIp") String clientIp, @Param("businessIds") List<UUID> businessIds);

    @Query("SELECT ba.businessId FROM SuBusinessAudit ba WHERE ba.userId = :userId AND ba.businessId IN :businessIds ORDER BY ba.id DESC")
    List<UUID> findRecentBusinessIdByUser(@Param("userId") String userId, @Param("businessIds") List<UUID> businessIds);
}
