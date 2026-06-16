package com.softinter.sicapi.dto.request;

import lombok.Data;

import java.util.List;
import java.util.UUID;

import com.softinter.sicapi.entity.enums.EntityState;
import com.softinter.sicapi.entity.ex.StorageUploadReference;

@Data
public class SaveProfileRequest {
    private String email;
    private UUID avatarUploadId;
    private UUID uploadGroupId;
    private List<StorageUploadReference> uploadGroupData;
    private String firstNameEn;
    private String middleNameEn;
    private String lastNameEn;
    private String firstNameLocal;
    private String middleNameLocal;
    private String lastNameLocal;
    private UUID titleId;
    private String phoneNumber;
    private String address;
    private UUID countryId;
    private UUID provinceId;
    private UUID districtId;
    private UUID subDistrictId;
    private String zipCode;
    private String addressEn;
    private String addressLocal;
    private Integer rowVersion;
    private Integer state;;          
    private UUID id;                     
    private String referenceNumber;     
    private String verifyToken;          
}
