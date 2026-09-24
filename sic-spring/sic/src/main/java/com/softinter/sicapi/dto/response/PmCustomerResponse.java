package com.softinter.sicapi.dto.response;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.softinter.sicapi.entity.ex.StorageUploadReference;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PmCustomerResponse {
    private UUID id;
    private UUID businessId;
    private UUID uploadGroupId;
    private List<StorageUploadReference> uploadGroupData = new ArrayList<>();
    private String customerCode;
    private String taxId;
    private String branchCode;
    private UUID titleId;
    private String titleName;
    private String companyNameEn;
    private String companyNameLocal;
    private String firstNameEn;
    private String middleNameEn;
    private String lastNameEn;
    private String firstNameLocal;
    private String middleNameLocal;
    private String lastNameLocal;
    private String contactPerson;
    private String phoneNumber;
    private String email;
    private String lineId;
    private String addressEn;
    private String addressLocal;
    private UUID countryId;
    private String countryName;
    @JsonProperty("supportLocalAddress")
    private Boolean supportLocalAddress;
    private UUID provinceId;
    private String provinceName;
    private UUID districtId;
    private String districtName;
    private UUID subDistrictId;
    private String subDistrictName;
    private String zipCode;
    private String personType;
    @JsonProperty("isActive")
    private Boolean isActive;
    private String remark;
    private Instant createdDate;
    private Instant updatedDate;
    private Integer rowVersion;
}