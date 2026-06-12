package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.util.UUID;

@Data
public class BusinessResponse {
    private UUID id;
    private String taxId;
    private String businessCode;
    private String branchCode;
    private String personType;
    private UUID titleId;
    private String titleName;
    private String firstNameEn;
    private String middleNameEn;
    private String lastNameEn;
    private String firstNameLocal;
    private String middleNameLocal;
    private String lastNameLocal;
    private UUID countryId;
    private String countryName;
    private boolean supportLocalAddress;
    private String addressEn;
    private String addressLocal;
    private UUID provinceId;
    private String provinceName;
    private UUID districtId;
    private String districtName;
    private UUID subDistrictId;
    private String subDistrictName;
    private String zipCode;
    private String email;
    private String phoneNumber;
    private String fax;
    private UUID uploadGroupId;
    private boolean isActive;
    private Integer rowVersion;
}
