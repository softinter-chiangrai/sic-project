package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.enums.ApprovalStatus;
import com.softinter.sicapi.entity.pm.PmApproval;
import com.softinter.sicapi.entity.pm.PmApprovalStepStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PmApprovalRepository extends JpaRepository<PmApproval, UUID>, JpaSpecificationExecutor<PmApproval> {

    // ===== Document =====
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

    // ===== Status =====
    Page<PmApproval> findByStatusAndIsActiveTrue(ApprovalStatus status, Pageable pageable);

    @Query("SELECT a FROM PmApproval a WHERE a.status IN :statuses AND a.isActive = true")
    Page<PmApproval> findByStatusIn(@Param("statuses") List<ApprovalStatus> statuses, Pageable pageable);

    // ===== Approver =====
    @Query("SELECT a FROM PmApproval a " +
           "JOIN a.stepStatuses ss " +
           "WHERE ss.status = 'PENDING' " +
           "AND ss.approver = :approverId " +
           "AND a.isActive = true " +
           "AND a.status IN ('PENDING', 'PARTIALLY_APPROVED') " +
           "ORDER BY a.requestedDate ASC")
    Page<PmApproval> findPendingByApprover(@Param("approverId") String approverId, Pageable pageable);

    // ===== Requested By =====
    Page<PmApproval> findByRequestedByAndIsActiveTrueOrderByRequestedDateDesc(String requestedBy, Pageable pageable);

    // ===== Counts =====
    long countByStatusAndIsActiveTrue(ApprovalStatus status);

    @Query("SELECT COUNT(a) FROM PmApproval a WHERE a.status = 'PENDING' AND a.isActive = true AND a.documentType = :documentType")
    long countPendingByDocumentType(@Param("documentType") String documentType);

    // ===== Business =====
    Page<PmApproval> findByBusinessIdAndIsActiveTrueOrderByRequestedDateDesc(UUID businessId, Pageable pageable);

    // ===== Active =====
    @Query("SELECT a FROM PmApproval a WHERE a.documentType = :documentType AND a.documentId = :documentId AND a.isActive = true ORDER BY a.createdDate DESC")
    List<PmApproval> findActiveByDocument(@Param("documentType") String documentType, @Param("documentId") UUID documentId);

    boolean existsByDocumentTypeAndDocumentIdAndStatusAndIsActiveTrue(String documentType, UUID documentId, ApprovalStatus status);

    // ===== Current Step =====
    @Query("SELECT ss FROM PmApprovalStepStatus ss " +
           "WHERE ss.approval.id = :approvalId " +
           "AND ss.status = 'PENDING' " +
           "AND ss.isCompleted = false " +
           "ORDER BY ss.step.stepOrder ASC")
    List<PmApprovalStepStatus> findPendingSteps(@Param("approvalId") UUID approvalId);
}