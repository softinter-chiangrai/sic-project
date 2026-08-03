// ============================================================
// 2. PmApprovalFlowStepRepository.java (เพิ่ม method)
// ============================================================
package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmApprovalFlowStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PmApprovalFlowStepRepository extends JpaRepository<PmApprovalFlowStep, UUID>, JpaSpecificationExecutor<PmApprovalFlowStep> {

    List<PmApprovalFlowStep> findByFlowIdOrderByStepOrderAsc(UUID flowId);

    List<PmApprovalFlowStep> findByFlowIdAndIsDeleteFalseOrderByStepOrderAsc(UUID flowId);

    List<PmApprovalFlowStep> findByFlowIdAndIsRequiredTrueOrderByStepOrderAsc(UUID flowId);

    List<PmApprovalFlowStep> findByFlowIdAndIsRequiredFalseOrderByStepOrderAsc(UUID flowId);

    @Modifying
    @Query("DELETE FROM PmApprovalFlowStep s WHERE s.flow.id = :flowId")
    void deleteByFlowId(@Param("flowId") UUID flowId);
}