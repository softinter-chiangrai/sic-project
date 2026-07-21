package com.softinter.sicapi.repository.pm;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.softinter.sicapi.entity.pm.PmTask;

@Repository
public interface PmTaskRepository extends JpaRepository<PmTask, UUID> {

    List<PmTask> findByWorkPackageIdAndIsDeleteFalse(UUID workPackageId);

    List<PmTask> findBySpecificationIdIn(List<UUID> specIds);
}
