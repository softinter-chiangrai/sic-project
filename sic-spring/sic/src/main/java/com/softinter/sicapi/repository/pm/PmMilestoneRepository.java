package com.softinter.sicapi.repository.pm;

import java.util.List;
import java.util.UUID;

import com.softinter.sicapi.entity.pm.PmMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PmMilestoneRepository extends JpaRepository<PmMilestone, UUID> {
    List<PmMilestone> findByPhaseIdAndIsDeleteFalseOrderByDueDateAsc(UUID phaseId);
}
