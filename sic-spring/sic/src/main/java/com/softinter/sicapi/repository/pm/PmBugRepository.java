package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmBug;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import java.util.Collection;
import java.util.List;

@Repository
public interface PmBugRepository extends JpaRepository<PmBug, UUID>, JpaSpecificationExecutor<PmBug> {

    Page<PmBug> findByBusinessIdAndIsDeleteFalse(UUID businessId, Pageable pageable);

    Page<PmBug> findByBusinessIdAndProjectIdAndIsDeleteFalse(UUID businessId, UUID projectId, Pageable pageable);

    Optional<PmBug> findByIdAndBusinessIdAndIsDeleteFalse(UUID id, UUID businessId);

    List<PmBug> findByTestCaseIdAndIsDeleteFalse(UUID testCaseId);

    List<PmBug> findByTaskIdAndIsDeleteFalse(UUID taskId);

    long countByBusinessIdAndIsDeleteFalse(UUID businessId);

    long countByBusinessIdAndSeverityIgnoreCaseAndIsDeleteFalse(UUID businessId, String severity);

    long countByBusinessIdAndStatusIgnoreCaseAndIsDeleteFalse(UUID businessId, String status);

    long countByProjectIdAndIsDeleteFalse(UUID projectId);

    long countByProjectIdAndStatusNotInAndIsDeleteFalse(UUID projectId, Collection<String> closedStatuses);

    long countByProjectIdAndSeverityInAndStatusNotAndIsDeleteFalse(UUID projectId, Collection<String> severities, String status);

    long countByBusinessIdAndStatusNotInAndIsDeleteFalse(UUID businessId, Collection<String> closedStatuses);

    long countByBusinessIdAndSeverityInAndStatusNotInAndIsDeleteFalse(
            UUID businessId, Collection<String> severities, Collection<String> closedStatuses);
}