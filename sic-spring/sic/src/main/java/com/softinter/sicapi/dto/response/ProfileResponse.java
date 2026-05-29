package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.util.UUID;

@Data
public class ProfileResponse {
    private UUID id;
    private String userId;
    private String email;
    private String firstNameEn;
    private String lastNameEn;
    private String firstNameLocal;
    private String lastNameLocal;
    private UUID titleId;
    private String titleName;
    private String phoneNumber;
    private String address;
    private UUID countryId;
    private String countryName;
    private UUID provinceId;
    private String provinceName;
    private UUID districtId;
    private String districtName;
    private UUID subDistrictId;
    private String subDistrictName;
    private String zipCode;
    private boolean isVerified;
}
