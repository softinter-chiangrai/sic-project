package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.enums.PaymentStatus;
import com.softinter.sicapi.entity.pm.PmInvoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PmInvoiceRepository extends JpaRepository<PmInvoice, UUID>, JpaSpecificationExecutor<PmInvoice> {
    Optional<PmInvoice> findByIdAndBusinessIdAndIsDeleteFalse(UUID id, UUID businessId);
    Page<PmInvoice> findByBusinessIdAndIsDeleteFalse(UUID businessId, Pageable pageable);
    Page<PmInvoice> findByBusinessIdAndProjectIdAndIsDeleteFalse(UUID businessId, UUID projectId, Pageable pageable);
    List<PmInvoice> findByBusinessIdAndCustomerIdAndIsDeleteFalse(UUID businessId, UUID customerId);
    long countByProjectIdAndIsDeleteFalse(UUID projectId);

    boolean existsByBusinessIdAndProjectIdAndInvoiceNoAndIsDeleteFalse(
            UUID businessId, UUID projectId, String invoiceNo);

    long countByBusinessIdAndPaymentStatusInAndIsDeleteFalse(UUID businessId, Collection<PaymentStatus> statuses);

    @Query("SELECT COALESCE(SUM(i.totalAmount - i.paidAmount), 0) FROM PmInvoice i " +
           "WHERE i.businessId = :businessId AND i.isDelete = false AND i.paymentStatus IN :statuses")
    BigDecimal sumOutstandingAmount(@Param("businessId") UUID businessId, @Param("statuses") Collection<PaymentStatus> statuses);
}
