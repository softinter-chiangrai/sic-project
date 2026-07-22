// File: sic-spring/sic/src/main/java/com/softinter/sicapi/dto/response/PmDiagramTabResponse.java
package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Data
public class PmDiagramTabResponse {
    private UUID id;
    private String name;
    private String diagramType;
    private String mermaidScript;

    // เปลี่ยนจาก String เป็น Map เพื่อให้ Frontend รับ Object ได้สะดวก
    private Map<String, Object> metadata;

    private Map<String, Object> graphData;

    private UUID projectId;
    private String projectName;
    private Integer sortOrder;
    private Boolean isActive;
    private Instant createdDate;
    private Instant updatedDate;
    private Integer versionCount;
    private Integer rowVersion;
}