package com.softinter.sicapi.repository.pm;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.softinter.sicapi.entity.pm.PmDelivery;

@Repository
public interface PmDeliveryRepository extends JpaRepository<PmDelivery, UUID>, JpaSpecificationExecutor<PmDelivery> {
    Optional<PmDelivery> findByIdAndBusinessIdAndIsDeleteFalse(UUID id, UUID businessId);

    Page<PmDelivery> findByBusinessIdAndProjectIdAndIsDeleteFalse(UUID businessId, UUID projectId, Pageable pageable);

    List<PmDelivery> findByBusinessIdAndProjectIdAndIsDeleteFalseOrderByCreatedDateDesc(UUID businessId, UUID projectId);

    Page<PmDelivery> findByBusinessIdAndIsDeleteFalse(UUID businessId, Pageable pageable);

    List<PmDelivery> findByBusinessIdAndIsDeleteFalseOrderByCreatedDateDesc(UUID businessId);

    long countByBusinessIdAndIsDeleteFalse(UUID businessId);

    long countByProjectIdAndIsDeleteFalse(UUID projectId);

    boolean existsByBusinessIdAndProjectIdAndDeliveryCodeAndIsDeleteFalse(
            UUID businessId, UUID projectId, String deliveryCode);
    @Query(value = "SELECT * FROM pm_delivery d WHERE d.business_id = :businessId AND d.project_id = :projectId AND d.is_delete = false AND (d.embedding <=> cast(:vec as vector)) < :maxDistance ORDER BY d.embedding <=> cast(:vec as vector) LIMIT :lim", nativeQuery = true)
    List<PmDelivery> findTopSimilar(@Param("businessId") UUID businessId, @Param("projectId") UUID projectId, @Param("vec") String vec, @Param("maxDistance") double maxDistance, @Param("lim") int lim);
}
