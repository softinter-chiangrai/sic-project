package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmDeliveryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PmDeliveryItemRepository extends JpaRepository<PmDeliveryItem, UUID> {
    List<PmDeliveryItem> findByDeliveryIdAndIsDeleteFalseOrderBySortOrderAsc(UUID deliveryId);
    List<PmDeliveryItem> findByDeliveryIdAndItemTypeAndIsDeleteFalseOrderBySortOrderAsc(UUID deliveryId, String itemType);
    void deleteByDeliveryId(UUID deliveryId);
}
