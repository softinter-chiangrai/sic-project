package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmInvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PmInvoiceItemRepository extends JpaRepository<PmInvoiceItem, UUID> {
    List<PmInvoiceItem> findByInvoiceIdAndIsDeleteFalseOrderBySortOrderAsc(UUID invoiceId);
}
