package com.softinter.sicapi.repository.pm;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.softinter.sicapi.entity.pm.PmTask;

@Repository
public interface PmTaskRepository extends JpaRepository<PmTask, UUID> {

    List<PmTask> findByWorkPackageIdAndIsDeleteFalse(UUID workPackageId);

    List<PmTask> findBySpecificationIdIn(List<UUID> specIds);

    List<PmTask> findBySpecificationIdAndIsDeleteFalse(UUID specId);

    List<PmTask> findByWorkPackageMilestonePhaseProjectIdAndIsDeleteFalse(UUID projectId);

    @Query("SELECT t FROM PmTask t " +
           "JOIN t.workPackage wp JOIN wp.milestone m JOIN m.phase ph JOIN ph.project p " +
           "WHERE p.businessId = :businessId AND t.isDelete = false AND p.isDelete = false " +
           "AND t.endDate IS NOT NULL AND t.status NOT IN :doneStatuses " +
           "ORDER BY t.endDate ASC")
    List<PmTask> findUpcomingByBusinessId(@Param("businessId") UUID businessId,
                                           @Param("doneStatuses") Collection<String> doneStatuses,
                                           Pageable pageable);
}
