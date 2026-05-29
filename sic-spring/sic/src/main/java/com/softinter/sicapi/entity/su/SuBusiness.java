package com.softinter.sicapi.entity.su;

import com.softinter.sicapi.entity.base.BaseEntity;
import com.softinter.sicapi.entity.db.DbCountry;
import com.softinter.sicapi.entity.db.DbDistrict;
import com.softinter.sicapi.entity.db.DbProvince;
import com.softinter.sicapi.entity.db.DbSubDistrict;
import com.softinter.sicapi.entity.db.DbTitle;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "su_business")
public class SuBusiness extends BaseEntity {

    @Column(name = "tax_id", length = 30)
    private String taxId;

    @Column(name = "business_code", nullable = false, length = 30)
    private String businessCode;

    @Column(name = "branch_code", length = 30)
    private String branchCode;

    @Column(name = "person_type", nullable = false, length = 100)
    private String personType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "title_id", nullable = false)
    private DbTitle title;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "country_id", nullable = false)
    private DbCountry country;

    @Column(name = "support_local_address", nullable = false)
    private Boolean supportLocalAddress = false;

    @Column(name = "address_en", length = 255)
    private String addressEn;

    @Column(name = "address_local", length = 255)
    private String addressLocal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "province_id")
    private DbProvince province;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "district_id")
    private DbDistrict district;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_district_id")
    private DbSubDistrict subDistrict;

    @Column(name = "zip_code", length = 20)
    private String zipCode;

    @Column(name = "email", length = 320)
    private String email;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "fax", length = 20)
    private String fax;

    @Column(name = "upload_group_id")
    private UUID uploadGroupId;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = false;

    @OneToMany(mappedBy = "business", fetch = FetchType.LAZY)
    private List<SuUserBusiness> userBusinesses = new ArrayList<>();

    @OneToMany(mappedBy = "business", fetch = FetchType.LAZY)
    private List<SuBusinessRole> businessRoles = new ArrayList<>();

    @OneToMany(mappedBy = "business", fetch = FetchType.LAZY)
    private List<SuBusinessAudit> businessAudits = new ArrayList<>();
}
