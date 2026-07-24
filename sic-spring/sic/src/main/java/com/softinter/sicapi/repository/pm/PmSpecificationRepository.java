package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PmSpecificationRepository extends JpaRepository<PmSpecification, UUID>, JpaSpecificationExecutor<PmSpecification> {

    Page<PmSpecification> findByProjectIdAndBusinessIdAndIsDeleteFalse(UUID projectId, UUID businessId, Pageable pageable);

    Page<PmSpecification> findByBusinessIdAndIsDeleteFalse(UUID businessId, Pageable pageable);

    Optional<PmSpecification> findByIdAndBusinessIdAndIsDeleteFalse(UUID id, UUID businessId);

    List<PmSpecification> findByRequirementIdAndIsDeleteFalse(UUID requirementId);

    @Query("SELECT s FROM PmSpecification s LEFT JOIN FETCH s.project p LEFT JOIN FETCH s.requirement r WHERE s.id = :id AND s.businessId = :businessId AND s.isDelete = false")
    Optional<PmSpecification> findByIdWithDetails(@Param("id") UUID id, @Param("businessId") UUID businessId);
}