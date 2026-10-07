package com.softinter.sicapi.dto.request;

import java.util.List;
import java.util.UUID;

import lombok.Data;

@Data
public class AiPhaseWbsRequest implements AiDraftRequest {
    private UUID phaseId;
    /** คำสั่งเพิ่มเติมจากผู้ใช้ (ไม่บังคับ) เช่น เน้นงานส่วนไหน */
    private String prompt;
    private String model;
    private List<AiAttachmentDto> attachments;
    /** ระบบเติมจาก phase เพื่อให้ AI รู้ขอบเขตโครงการ (ไม่รับจาก client) */
    private UUID projectId;
}
