package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmApprovalFlow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PmApprovalFlowRepository extends JpaRepository<PmApprovalFlow, UUID>, JpaSpecificationExecutor<PmApprovalFlow> {

    Optional<PmApprovalFlow> findByFlowCode(String flowCode);

    Optional<PmApprovalFlow> findByBusinessIdAndDocumentTypeAndIsActiveTrue(UUID businessId, String documentType);

    List<PmApprovalFlow> findByBusinessIdAndDocumentTypeAndIsActiveTrueOrderByFlowCode(UUID businessId, String documentType);

    @Query("SELECT f FROM PmApprovalFlow f WHERE ((:businessId IS NOT NULL AND f.businessId = :businessId) OR f.businessId IS NULL) AND f.documentType = :documentType AND f.isActive = true AND f.isDelete = false ORDER BY f.businessId DESC NULLS LAST, f.flowCode ASC")
    List<PmApprovalFlow> findAvailableFlowsByDocumentType(@Param("businessId") UUID businessId, @Param("documentType") String documentType);

    List<PmApprovalFlow> findByIsActiveTrueOrderByFlowCode();
}