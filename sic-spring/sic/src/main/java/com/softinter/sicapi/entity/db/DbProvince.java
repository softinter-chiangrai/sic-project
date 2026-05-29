package com.softinter.sicapi.entity.db;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "db_province",
       indexes = {
           @Index(name = "idx_province_code", columnList = "province_code", unique = true)
       })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class DbProvince extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "country_id", nullable = false)
    private DbCountry country;

    @Column(name = "province_code", nullable = false, length = 10)
    private String provinceCode;

    @Column(name = "province_name_en", nullable = false, length = 255)
    private String provinceNameEn;

    @Column(name = "province_name_local", nullable = false, length = 255)
    private String provinceNameLocal;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = false;

    @OneToMany(mappedBy = "province") // สมมติว่า DbDistrict มีฟิลด์ province
    private List<DbDistrict> districts = new ArrayList<>();
}