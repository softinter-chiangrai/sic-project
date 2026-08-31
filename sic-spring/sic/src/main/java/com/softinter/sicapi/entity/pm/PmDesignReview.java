package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "pm_design_review")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmDesignReview extends BaseBusinessEntity {

    @Column(name = "review_code", length = 30)
    private String reviewCode;

    @Column(name = "title", length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private PmCustomerProject project;

    @Column(name = "review_item_type", length = 50)
    private String reviewItemType;

    @Column(name = "review_item_id")
    private UUID reviewItemId;

    @Column(name = "reviewer", length = 100)
    private String reviewer;

    @Column(name = "assigned_to", length = 100)
    private String assignedTo;

    @Column(name = "severity", length = 20)
    private String severity = "Medium";

    @Column(name = "status", length = 20)
    private String status = "Open";

    @Column(name = "due_date")
    private Instant dueDate;

    @Column(name = "figma_url", columnDefinition = "TEXT")
    private String figmaUrl;

    @Column(name = "embed_mode", length = 20)
    private String embedMode = "prototype";

    @Column(name = "is_active")
    private Boolean isActive = true;

    @OneToMany(mappedBy = "designReview", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<PmReviewComment> comments = new ArrayList<>();
}
