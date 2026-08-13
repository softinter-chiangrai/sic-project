package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmDelivery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PmDeliveryRepository extends JpaRepository<PmDelivery, UUID>, JpaSpecificationExecutor<PmDelivery> {
    Optional<PmDelivery> findByIdAndBusinessIdAndIsDeleteFalse(UUID id, UUID businessId);

    Page<PmDelivery> findByBusinessIdAndProjectIdAndIsDeleteFalse(UUID businessId, UUID projectId, Pageable pageable);

    Page<PmDelivery> findByBusinessIdAndIsDeleteFalse(UUID businessId, Pageable pageable);
}
