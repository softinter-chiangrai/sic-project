package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmTestScenario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PmTestScenarioRepository extends JpaRepository<PmTestScenario, UUID> {

    List<PmTestScenario> findByBusinessIdAndProjectIdAndIsDeleteFalse(UUID businessId, UUID projectId);

    List<PmTestScenario> findByBusinessIdAndIsDeleteFalse(UUID businessId);

    Optional<PmTestScenario> findByIdAndBusinessIdAndIsDeleteFalse(UUID id, UUID businessId);
}