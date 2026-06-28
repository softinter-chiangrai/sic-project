package com.softinter.sicapi.entity.su;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "su_business_role",
       indexes = {
           @Index(name = "idx_business_role_code", columnList = "business_id, role_code", unique = true)
       })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class SuBusinessRole extends BaseEntity {

    // Foreign key fields (explicit to match C# property names)
    @Column(name = "business_id", insertable = false, updatable = false)
    private UUID businessId;

    @Column(name = "parent_role_id", insertable = false, updatable = false)
    private UUID parentRoleId;

    // Navigation properties
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private SuBusiness business;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_role_id")
    private SuBusinessRole parentRole;

    @Column(name = "role_code", nullable = false, length = 50)
    private String roleCode;

    @Column(name = "role_name_en", nullable = false, length = 255)
    private String roleNameEn;

    @Column(name = "role_name_local", nullable = false, length = 255)
    private String roleNameLocal;

    @Column(name = "role_level", length = 50)
    private String roleLevel;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "color", length = 20)
    private String color;

    // Collections
    @OneToMany(mappedBy = "parentRole", fetch = FetchType.LAZY)
    private List<SuBusinessRole> childRoles = new ArrayList<>();

    @OneToMany(mappedBy = "businessRole", fetch = FetchType.LAZY)
    private List<SuBusinessRoleProgram> rolePrograms = new ArrayList<>();

    @OneToMany(mappedBy = "businessRole", fetch = FetchType.LAZY)
    private List<SuUserBusinessRole> userBusinessRoles = new ArrayList<>();

    @OneToMany(mappedBy = "suBusinessRole", fetch = FetchType.LAZY)
    private List<SuBusinessInvite> invites = new ArrayList<>();
}
