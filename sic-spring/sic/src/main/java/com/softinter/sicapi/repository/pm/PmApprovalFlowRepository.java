package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmApprovalFlow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PmApprovalFlowRepository extends JpaRepository<PmApprovalFlow, UUID>, JpaSpecificationExecutor<PmApprovalFlow> {

    Optional<PmApprovalFlow> findByFlowCode(String flowCode);

    Optional<PmApprovalFlow> findByDocumentTypeAndIsActiveTrue(String documentType);

    List<PmApprovalFlow> findByDocumentTypeAndIsActiveTrueOrderByFlowCode(String documentType);

    List<PmApprovalFlow> findByIsActiveTrueOrderByFlowCode();
}