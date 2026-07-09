package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.enums.ApprovalStatus;
import com.softinter.sicapi.entity.pm.PmApprovalStepStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PmApprovalStepStatusRepository extends JpaRepository<PmApprovalStepStatus, UUID>, JpaSpecificationExecutor<PmApprovalStepStatus> {

    List<PmApprovalStepStatus> findByApprovalIdOrderByStepStepOrderAsc(UUID approvalId);

    Optional<PmApprovalStepStatus> findByApprovalIdAndStepId(UUID approvalId, UUID stepId);

    List<PmApprovalStepStatus> findByApprovalIdAndStatusAndIsCompletedFalse(UUID approvalId, ApprovalStatus status);

    List<PmApprovalStepStatus> findByApproverAndStatusAndIsCompletedFalse(String approver, ApprovalStatus status);

    long countByApprovalIdAndStatusAndIsCompletedTrue(UUID approvalId, ApprovalStatus status);

    long countByApprovalIdAndStatusAndIsCompletedFalse(UUID approvalId, ApprovalStatus status);
}