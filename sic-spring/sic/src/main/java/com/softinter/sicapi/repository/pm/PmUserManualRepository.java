package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmUserManual;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PmUserManualRepository extends JpaRepository<PmUserManual, UUID>, JpaSpecificationExecutor<PmUserManual> {
    Optional<PmUserManual> findByIdAndBusinessIdAndIsDeleteFalse(UUID id, UUID businessId);

    Page<PmUserManual> findByBusinessIdAndProjectIdAndIsDeleteFalse(UUID businessId, UUID projectId, Pageable pageable);

    Page<PmUserManual> findByBusinessIdAndIsDeleteFalse(UUID businessId, Pageable pageable);
}
