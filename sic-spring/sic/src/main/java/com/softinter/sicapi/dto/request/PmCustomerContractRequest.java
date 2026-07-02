package com.softinter.sicapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class PmCustomerContractRequest {
    private UUID id;
    private Integer rowVersion;

    @NotBlank(message = "กรุณาระบุเลขที่สัญญา")
    private String contractNo;

    @NotBlank(message = "กรุณาเลือกประเภทสัญญา")
    private String contractType;

    // ✅ เพิ่ม customerId (รับจาก Frontend)
    @NotNull(message = "กรุณาเลือกลูกค้า")
    private UUID customerId;

    @NotNull(message = "กรุณาเลือกโครงการ")
    private UUID projectId;

    @NotNull(message = "กรุณาระบุวันที่เริ่ม")
    private LocalDate startDate;

    @NotNull(message = "กรุณาระบุวันที่สิ้นสุด")
    private LocalDate endDate;

    @NotNull(message = "กรุณาระบุมูลค่าสัญญา")
    @PositiveOrZero(message = "มูลค่าต้องไม่ติดลบ")
    private BigDecimal contractValue;

    private String paymentTerms;
    private String scopeSummary;

    @NotBlank(message = "กรุณาเลือกสถานะลงนาม")
    private String signStatus;

    private String renewalStatus;
    private Boolean isActive;
}