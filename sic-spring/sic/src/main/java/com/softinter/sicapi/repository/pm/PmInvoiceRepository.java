package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmInvoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PmInvoiceRepository extends JpaRepository<PmInvoice, UUID>, JpaSpecificationExecutor<PmInvoice> {
    Optional<PmInvoice> findByIdAndBusinessIdAndIsDeleteFalse(UUID id, UUID businessId);
    Page<PmInvoice> findByBusinessIdAndIsDeleteFalse(UUID businessId, Pageable pageable);
    Page<PmInvoice> findByBusinessIdAndProjectIdAndIsDeleteFalse(UUID businessId, UUID projectId, Pageable pageable);
    List<PmInvoice> findByBusinessIdAndCustomerIdAndIsDeleteFalse(UUID businessId, UUID customerId);
}
