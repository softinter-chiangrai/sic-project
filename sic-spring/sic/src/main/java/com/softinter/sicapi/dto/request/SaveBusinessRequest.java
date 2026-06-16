package com.softinter.sicapi.dto.request;

import lombok.Data;

import java.util.List;
import java.util.UUID;

import com.softinter.sicapi.entity.enums.EntityState;
import com.softinter.sicapi.entity.ex.StorageUploadReference;

@Data
public class SaveBusinessRequest {
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
    private boolean supportLocalAddress;
    private String addressEn;
    private String addressLocal;
    private UUID provinceId;
    private UUID districtId;
    private UUID subDistrictId;
    private String zipCode;
    private String email;
    private String phoneNumber;
    private String fax;
    private Integer state;; 
    private UUID uploadGroupId;
    private boolean isActive;
    private Integer rowVersion;
    private List<StorageUploadReference> uploadGroupData;
}
