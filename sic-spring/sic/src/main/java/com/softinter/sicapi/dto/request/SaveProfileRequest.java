package com.softinter.sicapi.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class SaveProfileRequest {
    private String email;
    private String firstNameEn;
    private String lastNameEn;
    private String firstNameLocal;
    private String lastNameLocal;
    private UUID titleId;
    private String phoneNumber;
    private String address;
    private UUID countryId;
    private UUID provinceId;
    private UUID districtId;
    private UUID subDistrictId;
    private String zipCode;
}
