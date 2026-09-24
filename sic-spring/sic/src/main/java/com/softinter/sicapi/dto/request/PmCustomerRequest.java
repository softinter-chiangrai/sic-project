package com.softinter.sicapi.dto.request;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PmCustomerRequest {

    @NotBlank(message = "กรุณาระบุรหัสลูกค้า")
    @Size(max = 30, message = "รหัสลูกค้าต้องไม่เกิน 30 ตัวอักษร")
    private String customerCode;

    @Size(max = 30)
    private String taxId;

    @Size(max = 30)
    private String branchCode;

    private UUID titleId;

    @Size(max = 255)
    private String companyNameEn;

    @Size(max = 255)
    private String companyNameLocal;

    @Size(max = 100)
    private String firstNameEn;

    @Size(max = 100)
    private String middleNameEn;

    @Size(max = 100)
    private String lastNameEn;

    @Size(max = 100)
    private String firstNameLocal;

    @Size(max = 100)
    private String middleNameLocal;

    @Size(max = 100)
    private String lastNameLocal;

    @Size(max = 255)
    private String contactPerson;

    @Size(max = 20)
    private String phoneNumber;

    @Size(max = 320)
    private String email;

    @Size(max = 100)
    private String lineId;

    private UUID countryId;

    @JsonProperty("supportLocalAddress")
    private Boolean supportLocalAddress;

    @Size(max = 500)
    private String addressEn;

    @Size(max = 500)
    private String addressLocal;

    private UUID provinceId;
    private UUID districtId;
    private UUID subDistrictId;

    @Size(max = 20)
    private String zipCode;

    @Size(max = 50)
    private String personType;

    @JsonProperty("isActive")
    private Boolean isActive = true;

    private String remark;

    // State & Version (for optimistic locking)
    private Integer state;
    private Integer rowVersion;

    private UUID uploadGroupId;
}