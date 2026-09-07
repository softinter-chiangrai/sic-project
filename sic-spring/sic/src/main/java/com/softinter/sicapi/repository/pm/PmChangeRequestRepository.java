package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmChangeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PmChangeRequestRepository
        extends JpaRepository<PmChangeRequest, UUID>, JpaSpecificationExecutor<PmChangeRequest> {
    Optional<PmChangeRequest> findByTargetTypeAndTargetIdAndStatusIn(String targetType, UUID targetId,
            List<String> statuses);

    List<PmChangeRequest> findByAssigneeIdAndStatusIn(String assigneeId, List<String> statuses);

    @Query("SELECT cr FROM PmChangeRequest cr " +
            "WHERE (UPPER(cr.targetType) = UPPER(:targetType) " +
            "   OR (UPPER(:targetType) IN ('SPEC', 'SPECIFICATION') AND UPPER(cr.targetType) IN ('SPEC', 'SPECIFICATION')) " +
            "   OR (UPPER(:targetType) IN ('MANUAL', 'USER_MANUAL') AND UPPER(cr.targetType) IN ('MANUAL', 'USER_MANUAL'))) " +
            "AND cr.targetId = :targetId " +
            "AND cr.isDelete = false " +
            "AND cr.status NOT IN ('REJECTED', 'CANCELLED', 'IMPLEMENTED')")
    List<PmChangeRequest> findActiveByTarget(@Param("targetType") String targetType,
            @Param("targetId") UUID targetId);

    long countByProjectIdAndIsDeleteFalse(UUID projectId);

    boolean existsByProjectIdAndCrCodeAndIsDeleteFalse(UUID projectId, String crCode);
}