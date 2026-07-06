package com.softinter.sicapi.repository.pm;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.softinter.sicapi.entity.pm.PmWorkPackage;

@Repository
public interface PmWorkPackageRepository extends JpaRepository<PmWorkPackage, UUID> {
    List<PmWorkPackage> findByMilestoneIdAndIsDeleteFalse(UUID milestoneId);
}
