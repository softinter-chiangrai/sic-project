package com.softinter.sicapi.repository.pm;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.softinter.sicapi.entity.pm.PmPhase;

@Repository
public interface PmPhaseRepository extends JpaRepository<PmPhase, UUID> {
    List<PmPhase> findByProjectIdAndIsDeleteFalseOrderByStartDateAsc(UUID projectId);
    long countByProjectId(UUID projectId);

    @Query("SELECT p FROM PmPhase p WHERE p.project.businessId = :businessId AND p.isDelete = false AND p.project.isDelete = false " +
           "AND (:keyword IS NULL OR LOWER(p.phaseName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.phaseCode) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<PmPhase> findByBusinessIdAndKeyword(@Param("businessId") UUID businessId, @Param("keyword") String keyword);
}
