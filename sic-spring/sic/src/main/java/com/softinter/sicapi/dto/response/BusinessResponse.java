package com.softinter.sicapi.dto.response;

import com.softinter.sicapi.entity.ex.StorageUploadReference;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
public class BusinessResponse {
    private UUID id;
    private String taxId;
    private String businessCode;
    private String branchCode;
    private String personType;
    private UUID titleId;
    private String firstNameEn;
    private String middleNameEn;
    private String lastNameEn;
    private String firstNameLocal;
    private String middleNameLocal;
    private String lastNameLocal;
    private UUID countryId;
    private Boolean supportLocalAddress;
    private String addressEn;
    private String addressLocal;
    private UUID provinceId;
    private UUID districtId;
    private UUID subDistrictId;
    private String zipCode;
    private String email;
    private String phoneNumber;
    private UUID uploadGroupId;
    private List<StorageUploadReference> uploadGroupData = new ArrayList<>();
    private Integer state;
    private Integer rowVersion;
}