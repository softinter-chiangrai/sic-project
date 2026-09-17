package com.softinter.sicapi.repository.pm;

import java.util.List;
import java.util.UUID;

import com.softinter.sicapi.entity.pm.PmMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PmMilestoneRepository extends JpaRepository<PmMilestone, UUID> {
    List<PmMilestone> findByPhaseIdAndIsDeleteFalseOrderByDueDateAsc(UUID phaseId);

    @Query("SELECT COUNT(m) FROM PmMilestone m WHERE m.phase.project.id = :projectId AND m.isDelete = false")
    long countByProjectId(@Param("projectId") UUID projectId);

    @Query("SELECT COUNT(m) FROM PmMilestone m WHERE m.phase.project.id = :projectId AND m.isDelete = false AND m.status = 'Done'")
    long countCompletedByProjectId(@Param("projectId") UUID projectId);
}
