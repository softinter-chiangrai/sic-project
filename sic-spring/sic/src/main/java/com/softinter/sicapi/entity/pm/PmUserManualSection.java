package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

@Entity
@Table(name = "pm_user_manual_section")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmUserManualSection extends BaseEntity {

    @Column(name = "manual_id", nullable = false)
    private UUID manualId;

    @Column(name = "section_code", length = 50)
    private String sectionCode;

    @Column(name = "section_title", nullable = false, length = 255)
    private String sectionTitle;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "permission_roles", columnDefinition = "TEXT")
    private String permissionRoles;

    @Column(name = "screenshot_group_id")
    private UUID screenshotGroupId;
}
