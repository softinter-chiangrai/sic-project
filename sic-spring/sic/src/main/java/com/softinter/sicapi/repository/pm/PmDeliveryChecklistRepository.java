package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmDeliveryChecklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PmDeliveryChecklistRepository extends JpaRepository<PmDeliveryChecklist, UUID> {
    List<PmDeliveryChecklist> findByDeliveryIdAndIsDeleteFalseOrderBySortOrderAsc(UUID deliveryId);
}
