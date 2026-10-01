package com.softinter.sicapi.service;

import java.util.UUID;

public interface PmDiagramExportService {
    /** imageDataUri = PNG ของแผนภาพที่ draw.io export มา (data URI หรือ base64 ล้วน, null = ไม่มีรูป) */
    byte[] exportDiagramPdf(UUID diagramId, UUID businessId, String lang, String imageDataUri);
}
