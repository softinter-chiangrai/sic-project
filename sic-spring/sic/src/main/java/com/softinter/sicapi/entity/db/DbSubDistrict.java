package com.softinter.sicapi.entity.db;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "db_sub_district",
       indexes = {
           @Index(name = "idx_sub_district_code", columnList = "sub_district_code", unique = true)
       })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class DbSubDistrict extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "district_id", nullable = false)
    private DbDistrict district;

    @Column(name = "sub_district_code", nullable = false, length = 10)
    private String subDistrictCode;

    @Column(name = "sub_district_name_en", nullable = false, length = 255)
    private String subDistrictNameEn;

    @Column(name = "sub_district_name_local", nullable = false, length = 255)
    private String subDistrictNameLocal;

    @Column(name = "zip_code", nullable = false, length = 20)
    private String zipCode;

    @Column(name = "latitude")
    private Long latitude;

    @Column(name = "longitude")
    private Long longitude;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = false;
}
