package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;
import com.softinter.sicapi.entity.su.SuUpload;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "pm_comment")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmComment extends BaseBusinessEntity {

    @Column(name = "target_type", nullable = false, length = 50)
    private String targetType; // PROJECT, TASK, REQUIREMENT, etc.

    @Column(name = "target_id", nullable = false)
    private UUID targetId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_comment_id")
    private PmComment parentComment;

    @OneToMany(mappedBy = "parentComment", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<PmComment> replies;

    @Column(name = "subject", length = 255)
    private String subject; // สำหรับโพสต์หลักเท่านั้น

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "attachment_group_id")
    private UUID attachmentGroupId;

    @Column(name = "is_decision")
    private Boolean isDecision = false;

    @Column(name = "is_question")
    private Boolean isQuestion = false;

    @Column(name = "is_resolved")
    private Boolean isResolved = false;

    @Column(name = "pinned")
    private Boolean pinned = false;

    @Column(name = "mention_user_id", length = 100)
    private String mentionUserId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "extra_data", columnDefinition = "JSONB")
    private String extraData;
}