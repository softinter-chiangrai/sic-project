package com.softinter.sicapi.dto.request;

import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class MilestoneRequest {
    private UUID phaseId;
    private String milestoneName;
    private String description;
    private LocalDate dueDate;
    private String color;
    private String status;

    /** optimistic locking (xmin): ส่งค่าที่ได้จาก GET กลับมาตอนแก้ไข */
    private Integer rowVersion;
    private UUID attachmentGroupId;
}
