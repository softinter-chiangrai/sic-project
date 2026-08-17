package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmTestCase;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PmTestCaseRepository extends JpaRepository<PmTestCase, UUID>, JpaSpecificationExecutor<PmTestCase> {

    Page<PmTestCase> findByBusinessIdAndIsDeleteFalse(UUID businessId, Pageable pageable);

    Page<PmTestCase> findByBusinessIdAndProjectIdAndIsDeleteFalse(UUID businessId, UUID projectId, Pageable pageable);

    List<PmTestCase> findByBusinessIdAndScenarioIdAndIsDeleteFalse(UUID businessId, UUID scenarioId);

    Optional<PmTestCase> findByIdAndBusinessIdAndIsDeleteFalse(UUID id, UUID businessId);

    long countByProjectIdAndIsDeleteFalse(UUID projectId);

    long countByProjectIdAndTestStatusAndIsDeleteFalse(UUID projectId, String testStatus);

    List<PmTestCase> findByTaskIdAndIsDeleteFalse(UUID taskId);
}