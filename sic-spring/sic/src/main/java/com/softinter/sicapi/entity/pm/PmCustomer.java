package com.softinter.sicapi.entity.pm;

import java.util.UUID;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;
import com.softinter.sicapi.entity.db.DbDistrict;
import com.softinter.sicapi.entity.db.DbProvince;
import com.softinter.sicapi.entity.db.DbSubDistrict;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pm_customer")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class PmCustomer extends BaseBusinessEntity {

    @Column(name = "customer_code", nullable = false, length = 30)
    private String customerCode;

    @Column(name = "upload_group_id")
    private UUID uploadGroupId;

    @Column(name = "tax_id", length = 30)
    private String taxId;

    @Column(name = "company_name_en", nullable = false, length = 255)
    private String companyNameEn;

    @Column(name = "company_name_local", nullable = false, length = 255)
    private String companyNameLocal;

    @Column(name = "contact_person", length = 255)
    private String contactPerson;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "email", length = 320)
    private String email;

    @Column(name = "line_id", length = 100)
    private String lineId;

    @Column(name = "address_en", length = 500)
    private String addressEn;

    @Column(name = "address_local", length = 500)
    private String addressLocal;

    @Column(name = "zip_code", length = 20)
    private String zipCode;

    @Column(name = "person_type") 
    private String personType;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "remark", columnDefinition = "TEXT")
    private String remark;

    // ===== Relationships =====
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "province_id")
    private DbProvince province;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "district_id")
    private DbDistrict district;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_district_id")
    private DbSubDistrict subDistrict;

    // Foreign key fields (read-only)
    @Column(name = "province_id", insertable = false, updatable = false)
    private UUID provinceId;

    @Column(name = "district_id", insertable = false, updatable = false)
    private UUID districtId;

    @Column(name = "sub_district_id", insertable = false, updatable = false)
    private UUID subDistrictId;
}