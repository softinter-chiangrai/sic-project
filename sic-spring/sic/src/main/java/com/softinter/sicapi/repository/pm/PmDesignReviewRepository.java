package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmDesignReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PmDesignReviewRepository extends JpaRepository<PmDesignReview, UUID>, JpaSpecificationExecutor<PmDesignReview> {

    @Query("SELECT r FROM PmDesignReview r WHERE r.id = :id AND r.businessId = :businessId AND r.isDelete = false")
    Optional<PmDesignReview> findByIdAndBusinessId(@Param("id") UUID id, @Param("businessId") UUID businessId);

    @Query("SELECT r FROM PmDesignReview r WHERE r.businessId = :businessId AND r.isDelete = false AND " +
           "(:projectId IS NULL OR r.project.id = :projectId) AND " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:keyword IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(r.reviewCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(r.reviewer) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<PmDesignReview> findReviews(
            @Param("businessId") UUID businessId,
            @Param("projectId") UUID projectId,
            @Param("status") String status,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}
