package com.softinter.sicapi.entity.su;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "su_business_role_program",
       indexes = {
           @Index(name = "idx_business_role_program", columnList = "business_role_id, program_id", unique = true)
       })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class SuBusinessRoleProgram extends BaseEntity {

    @Column(name = "business_role_id", insertable = false, updatable = false)
    private UUID businessRoleId;

    @Column(name = "program_id", insertable = false, updatable = false)
    private UUID programId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_role_id", nullable = false)
    private SuBusinessRole businessRole;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id", nullable = false)
    private SuProgram program;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = false;

    @Column(name = "is_add")
    private boolean isAdd;

    @Column(name = "is_back")
    private boolean isBack;

    @Column(name = "is_print")
    private boolean isPrint;

    @Column(name = "is_remove")
    private boolean isRemove;

    @Column(name = "is_save")
    private boolean isSave;

    @Column(name = "is_search")
    private boolean isSearch;
}