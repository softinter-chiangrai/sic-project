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

    @Query("SELECT w FROM PmWorkPackage w WHERE w.businessId = :businessId AND w.isDelete = false " +
           "AND (:keyword IS NULL OR :keyword = '' OR LOWER(w.packageName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')))")
    List<PmWorkPackage> findByBusinessIdAndKeyword(@Param("businessId") UUID businessId, @Param("keyword") String keyword);
}
