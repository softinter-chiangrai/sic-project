package com.softinter.sicapi.entity.su;

import com.softinter.sicapi.entity.base.BaseEntity;
import com.softinter.sicapi.entity.db.*;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "su_profile",
       indexes = {
           @Index(name = "idx_user_id", columnList = "user_id", unique = true)
       })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class SuProfile extends BaseEntity {

    @Column(name = "user_id", nullable = false, length = 100)
    private String userId;

    @Column(name = "tax_id", length = 30)
    private String taxId;

    // Foreign key fields (mirror, read-only)
    @Column(name = "title_id", nullable = false, insertable = false, updatable = false)
    private UUID titleId;

    @Column(name = "country_id", insertable = false, updatable = false)
    private UUID countryId;

    @Column(name = "province_id", insertable = false, updatable = false)
    private UUID provinceId;

    @Column(name = "district_id", insertable = false, updatable = false)
    private UUID districtId;

    @Column(name = "sub_district_id", insertable = false, updatable = false)
    private UUID subDistrictId;

    // Navigation properties (own the foreign key columns)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "title_id", nullable = false)
    private DbTitle title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "country_id")
    private DbCountry country;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "province_id")
    private DbProvince province;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "district_id")
    private DbDistrict district;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_district_id")
    private DbSubDistrict subDistrict;

    // Other fields
    @Column(name = "first_name_en", nullable = false, length = 100)
    private String firstNameEn;

    @Column(name = "middle_name_en", length = 100)
    private String middleNameEn;

    @Column(name = "last_name_en", length = 100)
    private String lastNameEn;

    @Column(name = "first_name_local", nullable = false, length = 100)
    private String firstNameLocal;

    @Column(name = "middle_name_local", length = 100)
    private String middleNameLocal;

    @Column(name = "last_name_local", length = 100)
    private String lastNameLocal;

    @Column(name = "support_local_address", nullable = false)
    private Boolean supportLocalAddress = false;

    @Column(name = "address_en", length = 255)
    private String addressEn;

    @Column(name = "address_local", length = 255)
    private String addressLocal;

    @Column(name = "zip_code", length = 20)
    private String zipCode;

    @Column(name = "email", nullable = false, length = 320)
    private String email;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "upload_group_id")
    private UUID uploadGroupId;

    @Column(name = "is_active")
    private Boolean isActive; 
}