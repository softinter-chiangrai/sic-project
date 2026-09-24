package com.softinter.sicapi.dto.request;

import java.util.UUID;

import lombok.Data;

@Data
public class AiPhaseWbsRequest {
    private UUID phaseId;
    /** คำสั่งเพิ่มเติมจากผู้ใช้ (ไม่บังคับ) เช่น เน้นงานส่วนไหน */
    private String prompt;
    private String model;
}
