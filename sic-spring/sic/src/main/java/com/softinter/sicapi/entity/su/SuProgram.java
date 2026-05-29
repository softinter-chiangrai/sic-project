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
@Table(name = "su_program",
       indexes = {
           @Index(name = "idx_program_code", columnList = "program_code", unique = true)
       })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class SuProgram extends BaseEntity {

    @Column(name = "parent_program_id", insertable = false, updatable = false)
    private UUID parentProgramId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_program_id")
    private SuProgram parentProgram;

    @Column(name = "program_code", nullable = false, length = 50)
    private String programCode;

    @Column(name = "icon", length = 100)
    private String icon;

    @Column(name = "name_en", nullable = false, length = 255)
    private String nameEn;

    @Column(name = "name_local", nullable = false, length = 255)
    private String nameLocal;

    @Column(name = "route_path", length = 500)
    private String routePath;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = false;

    @OneToMany(mappedBy = "parentProgram", fetch = FetchType.LAZY)
    private List<SuProgram> childPrograms = new ArrayList<>();

    @OneToMany(mappedBy = "program", fetch = FetchType.LAZY)
    private List<SuBusinessRoleProgram> suBusinessRolePrograms = new ArrayList<>();
}