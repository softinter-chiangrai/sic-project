package com.softinter.sicapi.repository.pm;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.softinter.sicapi.entity.pm.PmDelivery;

@Repository
public interface PmDeliveryRepository extends JpaRepository<PmDelivery, UUID>, JpaSpecificationExecutor<PmDelivery> {
    Optional<PmDelivery> findByIdAndBusinessIdAndIsDeleteFalse(UUID id, UUID businessId);

    Page<PmDelivery> findByBusinessIdAndProjectIdAndIsDeleteFalse(UUID businessId, UUID projectId, Pageable pageable);

    List<PmDelivery> findByBusinessIdAndProjectIdAndIsDeleteFalseOrderByCreatedDateDesc(UUID businessId, UUID projectId);

    Page<PmDelivery> findByBusinessIdAndIsDeleteFalse(UUID businessId, Pageable pageable);

    List<PmDelivery> findByBusinessIdAndIsDeleteFalseOrderByCreatedDateDesc(UUID businessId);
}
