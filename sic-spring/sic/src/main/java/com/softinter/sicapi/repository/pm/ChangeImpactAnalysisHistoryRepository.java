package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.ChangeImpactAnalysisHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChangeImpactAnalysisHistoryRepository extends JpaRepository<ChangeImpactAnalysisHistory, UUID> {

    List<ChangeImpactAnalysisHistory> findByChangeRequestIdAndIsDeleteFalseOrderByCreatedDateDesc(UUID changeRequestId);

    @Query("SELECT COALESCE(MAX(h.versionNo), 0) FROM ChangeImpactAnalysisHistory h WHERE h.changeRequest.id = :changeRequestId AND h.isDelete = false")
    int findMaxVersionNoByChangeRequestId(@Param("changeRequestId") UUID changeRequestId);
}
