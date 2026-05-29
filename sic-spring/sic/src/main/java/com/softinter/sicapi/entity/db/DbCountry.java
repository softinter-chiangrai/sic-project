package com.softinter.sicapi.entity.db;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "db_country",
       indexes = {
           @Index(name = "idx_country_code", columnList = "country_code", unique = true),
           @Index(name = "idx_iso_code", columnList = "iso_code", unique = true)
       })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class DbCountry extends BaseEntity {

    @Column(name = "country_code", nullable = false, length = 10)
    private String countryCode;

    @Column(name = "iso_code", nullable = false, length = 10)
    private String isoCode;

    @Column(name = "country_name_en", nullable = false, length = 100)
    private String countryNameEn;

    @Column(name = "country_name_local", nullable = false, length = 100)
    private String countryNameLocal;

    @Column(name = "support_local_address", nullable = false)
    private Boolean supportLocalAddress = false;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = false;

    @OneToMany(mappedBy = "country") 
    private List<DbProvince> provinces = new ArrayList<>();
}
