package com.softinter.sicapi.dto.request;

import lombok.Data;
import java.util.UUID;

@Data
public class DiagramTraceRequest {
    private UUID diagramId;
    private UUID projectId;
    private String xml;  // XML จาก Draw.io ที่มีหลายหน้า
}