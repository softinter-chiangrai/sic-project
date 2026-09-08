package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.enums.MaRenewalStatus;
import com.softinter.sicapi.entity.pm.PmMaRenewal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PmMaRenewalRepository extends JpaRepository<PmMaRenewal, UUID>, JpaSpecificationExecutor<PmMaRenewal> {
    Optional<PmMaRenewal> findByIdAndBusinessIdAndIsDeleteFalse(UUID id, UUID businessId);
    Page<PmMaRenewal> findByBusinessIdAndIsDeleteFalse(UUID businessId, Pageable pageable);
    Page<PmMaRenewal> findByBusinessIdAndProjectIdAndIsDeleteFalse(UUID businessId, UUID projectId, Pageable pageable);
    long countByProjectIdAndIsDeleteFalse(UUID projectId);

    boolean existsByBusinessIdAndProjectIdAndRenewalNoAndIsDeleteFalse(
            UUID businessId, UUID projectId, String renewalNo);

    @Query("SELECT r FROM PmMaRenewal r WHERE r.businessId = :businessId AND r.isDelete = false " +
           "AND r.status NOT IN :excludedStatuses AND r.currentEndDate BETWEEN :from AND :to " +
           "ORDER BY r.currentEndDate ASC")
    List<PmMaRenewal> findNearExpiry(@Param("businessId") UUID businessId,
                                      @Param("excludedStatuses") Collection<MaRenewalStatus> excludedStatuses,
                                      @Param("from") Instant from,
                                      @Param("to") Instant to);
}
