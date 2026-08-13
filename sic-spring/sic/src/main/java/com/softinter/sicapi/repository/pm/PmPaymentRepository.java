package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmPayment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PmPaymentRepository extends JpaRepository<PmPayment, UUID>, JpaSpecificationExecutor<PmPayment> {
    Optional<PmPayment> findByIdAndBusinessIdAndIsDeleteFalse(UUID id, UUID businessId);
    Page<PmPayment> findByBusinessIdAndIsDeleteFalse(UUID businessId, Pageable pageable);
    Page<PmPayment> findByBusinessIdAndInvoiceIdAndIsDeleteFalse(UUID businessId, UUID invoiceId, Pageable pageable);
    List<PmPayment> findByBusinessIdAndInvoiceIdAndIsDeleteFalse(UUID businessId, UUID invoiceId);
}
