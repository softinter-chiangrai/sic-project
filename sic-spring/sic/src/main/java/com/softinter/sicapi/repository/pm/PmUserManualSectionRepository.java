package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmUserManualSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PmUserManualSectionRepository extends JpaRepository<PmUserManualSection, UUID> {
    List<PmUserManualSection> findByManualIdAndIsDeleteFalseOrderBySortOrderAsc(UUID manualId);
}
