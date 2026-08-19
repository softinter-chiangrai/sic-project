package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "pm_review_comment")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmReviewComment extends BaseBusinessEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private PmDesignReview designReview;

    @Column(name = "comment_type", nullable = false, length = 20)
    private String commentType;

    @Column(name = "comment_text", nullable = false, columnDefinition = "TEXT")
    private String commentText;

    @Column(name = "severity", length = 20)
    private String severity;

    @Column(name = "assigned_to", length = 100)
    private String assignedTo;

    @Column(name = "status", length = 20)
    private String status = "Open";
}
