package com.softinter.sicapi.dto.response;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import lombok.Data;

@Data
public class PmCustomerProjectResponse {
    private UUID id;
    private UUID customerId;
    private String customerName;
    private UUID businessId;

    // ✅ เพิ่ม contractId และ contractNo
    private UUID contractId;
    private String contractNo;

    private String projectCode;
    private String projectName;
    private LocalDate startDate;
    private LocalDate plannedEndDate;
    private LocalDate actualEndDate;
    private Integer budgetManday;
    private Integer usedManday;
    private String status;
    private String priority;
    private String description;
    private Boolean isActive;
    private Instant createdDate;
    private Instant updatedDate;
    private Integer rowVersion;
    private String approvalStatus;
    private Boolean isApproved;

    /** เวอร์ชันเอกสารล่าสุด (จาก document version) สำหรับคอลัมน์ Version ในหน้า list */
    private String version;
}