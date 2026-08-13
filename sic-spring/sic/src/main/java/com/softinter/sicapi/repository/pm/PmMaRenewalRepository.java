package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmMaRenewal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PmMaRenewalRepository extends JpaRepository<PmMaRenewal, UUID>, JpaSpecificationExecutor<PmMaRenewal> {
    Optional<PmMaRenewal> findByIdAndBusinessIdAndIsDeleteFalse(UUID id, UUID businessId);
    Page<PmMaRenewal> findByBusinessIdAndIsDeleteFalse(UUID businessId, Pageable pageable);
    Page<PmMaRenewal> findByBusinessIdAndProjectIdAndIsDeleteFalse(UUID businessId, UUID projectId, Pageable pageable);
}
