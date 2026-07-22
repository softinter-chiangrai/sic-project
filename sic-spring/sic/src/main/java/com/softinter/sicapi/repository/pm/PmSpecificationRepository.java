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

    // ===== ✅ เพิ่ม method ที่หายไป =====
    Page<PmSpecification> findByProjectIdAndIsDeleteFalse(UUID projectId, Pageable pageable);

    // ===== Other methods =====
    List<PmSpecification> findByProjectIdAndIsDeleteFalse(UUID projectId);

    Optional<PmSpecification> findByIdAndBusinessIdAndIsDeleteFalse(UUID id, UUID businessId);

    @Query("SELECT s FROM PmSpecification s WHERE s.projectId = :projectId AND s.isDelete = false AND s.businessId = :businessId")
    Page<PmSpecification> findByProjectIdAndBusinessIdAndIsDeleteFalse(
            @Param("projectId") UUID projectId,
            @Param("businessId") UUID businessId,
            Pageable pageable);

    @Query("SELECT s FROM PmSpecification s WHERE s.isDelete = false AND s.businessId = :businessId")
    Page<PmSpecification> findByBusinessIdAndIsDeleteFalse(@Param("businessId") UUID businessId, Pageable pageable);

    List<PmSpecification> findByRequirementIdAndIsDeleteFalse(UUID requirementId);

    @Query("SELECT s FROM PmSpecification s WHERE s.requirement.id = :requirementId AND s.isDelete = false")
    List<PmSpecification> findByRequirementId(@Param("requirementId") UUID requirementId);
}