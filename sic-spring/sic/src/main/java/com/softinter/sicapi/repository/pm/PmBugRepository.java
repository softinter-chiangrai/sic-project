package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmBug;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PmBugRepository extends JpaRepository<PmBug, UUID>, JpaSpecificationExecutor<PmBug> {

    Page<PmBug> findByBusinessIdAndIsDeleteFalse(UUID businessId, Pageable pageable);

    Page<PmBug> findByBusinessIdAndProjectIdAndIsDeleteFalse(UUID businessId, UUID projectId, Pageable pageable);

    Optional<PmBug> findByIdAndBusinessIdAndIsDeleteFalse(UUID id, UUID businessId);

    long countByProjectIdAndSeverityInAndStatusNotAndIsDeleteFalse(UUID projectId, java.util.Collection<String> severities, String status);
}