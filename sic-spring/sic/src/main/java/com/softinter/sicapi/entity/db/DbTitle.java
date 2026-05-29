package com.softinter.sicapi.entity.db;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "db_title")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class DbTitle extends BaseEntity {

    @Column(name = "person_type", nullable = false, length = 20)
    private String personType;

    @Column(name = "prefix_short_name_en", nullable = false, length = 100)
    private String prefixShortNameEn;

    @Column(name = "prefix_short_name_local", nullable = false, length = 100)
    private String prefixShortNameLocal;

    @Column(name = "suffix_short_name_en", length = 100)
    private String suffixShortNameEn;

    @Column(name = "suffix_short_name_local", length = 100)
    private String suffixShortNameLocal;

    @Column(name = "prefix_name_en", nullable = false, length = 100)
    private String prefixNameEn;

    @Column(name = "prefix_name_local", nullable = false, length = 100)
    private String prefixNameLocal;

    @Column(name = "suffix_name_en", length = 100)
    private String suffixNameEn;

    @Column(name = "suffix_name_local", length = 100)
    private String suffixNameLocal;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = false;
}