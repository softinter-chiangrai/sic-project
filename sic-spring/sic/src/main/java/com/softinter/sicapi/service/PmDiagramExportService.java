package com.softinter.sicapi.service;

import java.util.UUID;
import java.util.List;
import java.util.Map;

public interface PmDiagramExportService {
    /** imageDataUri = PNG ของแผนภาพที่ draw.io export มา (data URI หรือ base64 ล้วน, null = ไม่มีรูป) */
    default byte[] exportDiagramPdf(UUID diagramId, UUID businessId, String lang, String imageDataUri) {
        return exportDiagramPdf(diagramId, businessId, lang, imageDataUri, null);
    }

    byte[] exportDiagramPdf(UUID diagramId, UUID businessId, String lang, String imageDataUri, List<Map<String, Object>> requestPages);

    /** รวมทุก Diagram ของโครงการเป็น PDF เล่มเดียว */
    byte[] exportAllDiagramsPdf(UUID projectId, UUID currentDiagramId, UUID businessId, String lang, String currentImageDataUri);

}
