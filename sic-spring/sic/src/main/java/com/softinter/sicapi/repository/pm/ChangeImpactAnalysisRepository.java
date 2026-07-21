// src/main/java/com/softinter/sicapi/repository/pm/ChangeImpactAnalysisRepository.java
package com.softinter.sicapi.repository.pm;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.softinter.sicapi.entity.pm.ChangeImpactAnalysis;

@Repository
public interface ChangeImpactAnalysisRepository extends JpaRepository<ChangeImpactAnalysis, UUID> {

    Optional<ChangeImpactAnalysis> findByChangeRequestId(UUID changeRequestId);

    // เรียก PostgreSQL function ที่สร้างใน Phase 1
    // คืนค่าเป็น Object[] เพราะ PostgreSQL ส่ง array กลับมา
    @Query(value = "SELECT impacted_requirement_ids, impacted_spec_ids, impacted_task_ids, impacted_test_case_ids, impacted_bug_ids FROM auto_detect_impact_from_change_request(:crId)", nativeQuery = true)
Object[] autoDetectByChangeRequest(@Param("crId") UUID changeRequestId);
}