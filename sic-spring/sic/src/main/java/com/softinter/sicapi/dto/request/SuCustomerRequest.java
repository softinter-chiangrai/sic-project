package com.softinter.sicapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuCustomerRequest {

    @NotBlank(message = "กรุณาระบุรหัสลูกค้า")
    @Size(max = 30, message = "รหัสลูกค้าต้องไม่เกิน 30 ตัวอักษร")
    private String customerCode;

    @Size(max = 30)
    private String taxId;

    @NotBlank(message = "กรุณาระบุชื่อบริษัท (อังกฤษ)")
    @Size(max = 255)
    private String companyNameEn;

    @NotBlank(message = "กรุณาระบุชื่อบริษัท (ไทย)")
    @Size(max = 255)
    private String companyNameLocal;

    @Size(max = 255)
    private String contactPerson;

    @Size(max = 20)
    private String phoneNumber;

    @Size(max = 320)
    private String email;

    @Size(max = 100)
    private String lineId;

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
    private String customerType;

    private Boolean isActive = true;

    private String remark;
}