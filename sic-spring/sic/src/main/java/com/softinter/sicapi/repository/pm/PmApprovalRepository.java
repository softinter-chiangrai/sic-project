// ============================================================
// 1. PmApprovalRepository.java
// ============================================================
package com.softinter.sicapi.repository.pm;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.softinter.sicapi.entity.enums.ApprovalStatus;
import com.softinter.sicapi.entity.pm.PmApproval;
import com.softinter.sicapi.entity.pm.PmApprovalStepStatus;

@Repository
public interface PmApprovalRepository extends JpaRepository<PmApproval, UUID>, JpaSpecificationExecutor<PmApproval> {

    @Query("SELECT a FROM PmApproval a WHERE a.documentType = :documentType AND a.documentId = :documentId AND a.isActive = true ORDER BY a.createdDate DESC")
    List<PmApproval> findByDocument(@Param("documentType") String documentType, @Param("documentId") UUID documentId);

    @Query("SELECT a FROM PmApproval a WHERE a.documentType = :documentType AND a.documentId = :documentId AND a.status = :status AND a.isActive = true")
    Optional<PmApproval> findByDocumentAndStatus(@Param("documentType") String documentType,
                                                  @Param("documentId") UUID documentId,
                                                  @Param("status") ApprovalStatus status);

    @Query("SELECT a FROM PmApproval a WHERE a.documentType = :documentType AND a.documentId = :documentId AND a.isActive = true ORDER BY a.createdDate DESC")
    Page<PmApproval> findPagedByDocument(@Param("documentType") String documentType,
                                         @Param("documentId") UUID documentId,
                                         Pageable pageable);

    Page<PmApproval> findByStatusAndIsActiveTrue(ApprovalStatus status, Pageable pageable);

    @Query("SELECT a FROM PmApproval a WHERE a.status IN :statuses AND a.isActive = true")
    Page<PmApproval> findByStatusIn(@Param("statuses") List<ApprovalStatus> statuses, Pageable pageable);

    @Query("SELECT a FROM PmApproval a " +
           "JOIN a.stepStatuses ss " +
           "WHERE ss.status = 'PENDING' " +
           "AND ss.approver = :approverId " +
           "AND a.isActive = true " +
           "AND a.status IN ('PENDING', 'PARTIALLY_APPROVED') " +
           "ORDER BY a.requestedDate ASC")
    Page<PmApproval> findPendingByApprover(@Param("approverId") String approverId, Pageable pageable);

    @Query("SELECT DISTINCT a FROM PmApproval a " +
           "JOIN a.stepStatuses ss " +
           "WHERE ss.approver = :approverId " +
           "AND ss.status != 'PENDING' " +
           "AND a.isActive = true " +
           "ORDER BY a.requestedDate DESC")
    Page<PmApproval> findApprovedHistoryByApprover(@Param("approverId") String approverId, Pageable pageable);

    Page<PmApproval> findByRequestedByAndIsActiveTrueOrderByRequestedDateDesc(String requestedBy, Pageable pageable);

    long countByStatusAndIsActiveTrue(ApprovalStatus status);

    @Query("SELECT COUNT(a) FROM PmApproval a WHERE a.status = 'PENDING' AND a.isActive = true AND a.documentType = :documentType")
    long countPendingByDocumentType(@Param("documentType") String documentType);

    Page<PmApproval> findByBusinessIdAndIsActiveTrueOrderByRequestedDateDesc(UUID businessId, Pageable pageable);

    @Query("SELECT a FROM PmApproval a WHERE a.documentType = :documentType AND a.documentId = :documentId AND a.isActive = true ORDER BY a.createdDate DESC")
    List<PmApproval> findActiveByDocument(@Param("documentType") String documentType, @Param("documentId") UUID documentId);

    boolean existsByDocumentTypeAndDocumentIdAndStatusAndIsActiveTrue(String documentType, UUID documentId, ApprovalStatus status);

    @Query("SELECT ss FROM PmApprovalStepStatus ss " +
           "WHERE ss.approval.id = :approvalId " +
           "AND ss.status = 'PENDING' " +
           "AND ss.isCompleted = false " +
           "ORDER BY ss.step.stepOrder ASC")
    List<PmApprovalStepStatus> findPendingSteps(@Param("approvalId") UUID approvalId);

    @Query("SELECT a FROM PmApproval a WHERE a.currentStep.id = :stepId AND a.isActive = true")
    List<PmApproval> findByCurrentStepId(@Param("stepId") UUID stepId);

    @Query("SELECT a FROM PmApproval a WHERE a.flow.id = :flowId AND a.isActive = true")
    List<PmApproval> findByFlowId(@Param("flowId") UUID flowId);

    @Query("SELECT COUNT(a) > 0 FROM PmApproval a WHERE a.flow.id = :flowId AND a.isActive = true AND a.status IN :statuses")
    boolean existsByFlowIdAndStatusIn(@Param("flowId") UUID flowId, @Param("statuses") List<ApprovalStatus> statuses);

    @Query("SELECT a FROM PmApproval a WHERE a.flow.id = :flowId AND a.isActive = true AND a.status IN :statuses")
    List<PmApproval> findByFlowIdAndStatusIn(@Param("flowId") UUID flowId, @Param("statuses") List<ApprovalStatus> statuses);
}