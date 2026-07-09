package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmApprovalLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PmApprovalLogRepository extends JpaRepository<PmApprovalLog, UUID>, JpaSpecificationExecutor<PmApprovalLog> {

    List<PmApprovalLog> findByApprovalIdOrderByCreatedDateAsc(UUID approvalId);

    List<PmApprovalLog> findByActorOrderByCreatedDateDesc(String actor);
}