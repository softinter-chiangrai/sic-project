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

import com.softinter.sicapi.entity.pm.PmRequirement;

@Repository
public interface PmRequirementRepository extends JpaRepository<PmRequirement, UUID>, JpaSpecificationExecutor<PmRequirement> {

    // ===== ใหม่: รองรับ projectId =====
    @Query("SELECT r FROM PmRequirement r LEFT JOIN FETCH r.project p WHERE r.businessId = :businessId AND r.projectId = :projectId AND r.isDelete = false")
    Page<PmRequirement> findAllByBusinessIdAndProjectId(@Param("businessId") UUID businessId,
                                                         @Param("projectId") UUID projectId,
                                                         Pageable pageable);

    @Query("SELECT r FROM PmRequirement r LEFT JOIN FETCH r.project p WHERE r.businessId = :businessId AND r.projectId = :projectId AND r.isDelete = false AND (LOWER(r.requirementCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(r.title) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<PmRequirement> searchByKeywordAndProject(@Param("businessId") UUID businessId,
                                                   @Param("projectId") UUID projectId,
                                                   @Param("keyword") String keyword,
                                                   Pageable pageable);

    @Query("SELECT r FROM PmRequirement r LEFT JOIN FETCH r.project p WHERE r.businessId = :businessId AND r.projectId = :projectId AND r.isDelete = false AND r.status = :status")
    Page<PmRequirement> findAllByStatusAndProject(@Param("businessId") UUID businessId,
                                                   @Param("projectId") UUID projectId,
                                                   @Param("status") String status,
                                                   Pageable pageable);

    @Query("SELECT r FROM PmRequirement r LEFT JOIN FETCH r.project p WHERE r.businessId = :businessId AND r.projectId = :projectId AND r.isDelete = false AND r.status = :status AND (LOWER(r.requirementCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(r.title) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<PmRequirement> searchByKeywordAndStatusAndProject(@Param("businessId") UUID businessId,
                                                            @Param("projectId") UUID projectId,
                                                            @Param("keyword") String keyword,
                                                            @Param("status") String status,
                                                            Pageable pageable);

    // ===== เก่า (ยังคงไว้เผื่อใช้ที่อื่น) =====
    @Query("SELECT r FROM PmRequirement r LEFT JOIN FETCH r.project p WHERE r.businessId = :businessId AND r.isDelete = false")
    Page<PmRequirement> findAllByBusinessId(@Param("businessId") UUID businessId, Pageable pageable);

    @Query("SELECT r FROM PmRequirement r LEFT JOIN FETCH r.project p WHERE r.id = :id AND r.businessId = :businessId AND r.isDelete = false")
    Optional<PmRequirement> findByIdAndBusinessId(@Param("id") UUID id, @Param("businessId") UUID businessId);

    @Query("SELECT r FROM PmRequirement r LEFT JOIN FETCH r.project p WHERE r.businessId = :businessId AND r.isDelete = false AND (LOWER(r.requirementCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(r.title) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<PmRequirement> searchByKeyword(@Param("businessId") UUID businessId, @Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT r FROM PmRequirement r LEFT JOIN FETCH r.project p WHERE r.businessId = :businessId AND r.isDelete = false AND r.status = :status")
    Page<PmRequirement> findAllByStatus(@Param("businessId") UUID businessId, @Param("status") String status, Pageable pageable);

    @Query("SELECT r FROM PmRequirement r LEFT JOIN FETCH r.project p WHERE r.businessId = :businessId AND r.isDelete = false AND r.status = :status AND (LOWER(r.requirementCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(r.title) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<PmRequirement> searchByKeywordAndStatus(@Param("businessId") UUID businessId, @Param("keyword") String keyword, @Param("status") String status, Pageable pageable);

    List<PmRequirement> findByBusinessIdAndIsDeleteFalse(UUID businessId);
    List<PmRequirement> findByBusinessIdAndProjectIdAndIsDeleteFalse(UUID businessId, UUID projectId);
}