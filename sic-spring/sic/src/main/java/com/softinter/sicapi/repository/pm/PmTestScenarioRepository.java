package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmTestScenario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PmTestScenarioRepository extends JpaRepository<PmTestScenario, UUID> {

    List<PmTestScenario> findByBusinessIdAndProjectIdAndIsDeleteFalse(UUID businessId, UUID projectId);

    List<PmTestScenario> findByBusinessIdAndIsDeleteFalse(UUID businessId);

    Optional<PmTestScenario> findByIdAndBusinessIdAndIsDeleteFalse(UUID id, UUID businessId);

    @Query(value = "SELECT * FROM pm_test_scenario s WHERE s.business_id = :businessId AND s.project_id = :projectId AND s.is_delete = false AND (s.embedding <=> cast(:vec as vector)) < :maxDistance ORDER BY s.embedding <=> cast(:vec as vector) LIMIT :lim", nativeQuery = true)
    List<PmTestScenario> findTopSimilar(@Param("businessId") UUID businessId, @Param("projectId") UUID projectId, @Param("vec") String vec, @Param("maxDistance") double maxDistance, @Param("lim") int lim);
}