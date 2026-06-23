package com.softinter.sicapi.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuCustomerResponse {
    private UUID id;
    private UUID businessId;
    private String customerCode;
    private String taxId;
    private String companyNameEn;
    private String companyNameLocal;
    private String contactPerson;
    private String phoneNumber;
    private String email;
    private String lineId;
    private String addressEn;
    private String addressLocal;
    private UUID provinceId;
    private String provinceName;
    private UUID districtId;
    private String districtName;
    private UUID subDistrictId;
    private String subDistrictName;
    private String zipCode;
    private String customerType;
    private Boolean isActive;
    private String remark;
    private Instant createdDate;
    private Instant updatedDate;
}