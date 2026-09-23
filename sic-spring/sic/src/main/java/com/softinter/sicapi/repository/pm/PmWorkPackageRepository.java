package com.softinter.sicapi.repository.pm;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.softinter.sicapi.entity.pm.PmWorkPackage;

@Repository
public interface PmWorkPackageRepository extends JpaRepository<PmWorkPackage, UUID> {
    List<PmWorkPackage> findByMilestoneIdAndIsDeleteFalse(UUID milestoneId);

    @Query("SELECT w FROM PmWorkPackage w " +
           "LEFT JOIN w.milestone m " +
           "LEFT JOIN m.phase ph " +
           "LEFT JOIN ph.project p " +
           "WHERE (w.businessId = :businessId OR p.businessId = :businessId) " +
           "AND w.isDelete = false " +
           "AND (:projectId IS NULL OR p.id = :projectId) " +
           "AND (:milestoneId IS NULL OR m.id = :milestoneId) " +
           "AND (:keyword IS NULL OR :keyword = '' OR LOWER(w.packageName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')))")
    List<PmWorkPackage> findByBusinessIdAndFilters(
            @Param("businessId") UUID businessId,
            @Param("projectId") UUID projectId,
            @Param("milestoneId") UUID milestoneId,
            @Param("keyword") String keyword);

    @Query("SELECT w FROM PmWorkPackage w " +
           "LEFT JOIN w.milestone m " +
           "LEFT JOIN m.phase ph " +
           "LEFT JOIN ph.project p " +
           "WHERE (w.businessId = :businessId OR p.businessId = :businessId) " +
           "AND w.isDelete = false " +
           "AND (:keyword IS NULL OR :keyword = '' OR LOWER(w.packageName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')))")
    List<PmWorkPackage> findByBusinessIdAndKeyword(@Param("businessId") UUID businessId, @Param("keyword") String keyword);
}
