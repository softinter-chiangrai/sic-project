package com.softinter.sicapi.entity.db;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "db_district",
       indexes = {
           @Index(name = "idx_district_code", columnList = "district_code", unique = true)
       })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class DbDistrict extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "province_id", nullable = false)
    private DbProvince province;

    @Column(name = "district_code", nullable = false, length = 10)
    private String districtCode;

    @Column(name = "district_name_en", nullable = false, length = 255)
    private String districtNameEn;

    @Column(name = "district_name_local", nullable = false, length = 255)
    private String districtNameLocal;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = false;

    @OneToMany(mappedBy = "district") // สมมติว่า DbSubDistrict มีฟิลด์ district
    private List<DbSubDistrict> subDistricts = new ArrayList<>();
}
