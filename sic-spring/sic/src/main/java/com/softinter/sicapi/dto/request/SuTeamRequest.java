package com.softinter.sicapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuTeamRequest {

    @NotBlank(message = "กรุณาระบุรหัสทีม")
    @Size(max = 30, message = "รหัสทีมต้องไม่เกิน 30 ตัวอักษร")
    private String teamCode;

    @NotBlank(message = "กรุณาระบุชื่อทีม (อังกฤษ)")
    @Size(max = 255)
    private String teamNameEn;

    @NotBlank(message = "กรุณาระบุชื่อทีม (ไทย)")
    @Size(max = 255)
    private String teamNameLocal;

    private String description;

    private String leaderId;

    private Boolean isActive = true;

    // รายการ user ids ที่จะเพิ่มเป็นสมาชิก (optional)
    private List<String> memberUserIds;
}