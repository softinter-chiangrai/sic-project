package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmReviewComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PmReviewCommentRepository extends JpaRepository<PmReviewComment, UUID> {

    @Query("SELECT c FROM PmReviewComment c WHERE c.designReview.id = :reviewId AND c.isDelete = false ORDER BY c.createdDate ASC")
    List<PmReviewComment> findByReviewId(@Param("reviewId") UUID reviewId);
}
