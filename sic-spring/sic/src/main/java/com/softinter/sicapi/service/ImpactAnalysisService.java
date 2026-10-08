package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.AiImpactPreviewRequest;
import com.softinter.sicapi.dto.request.SaveImpactAnalysisRequest;
import com.softinter.sicapi.dto.response.ImpactAnalysisHistoryResponse;
import com.softinter.sicapi.dto.response.ImpactAnalysisResponse;

import java.util.List;
import java.util.UUID;

public interface ImpactAnalysisService {

    ImpactAnalysisResponse getByChangeRequest(UUID changeRequestId);

    UUID save(SaveImpactAnalysisRequest request);

    // ✅ เพิ่ม method autoDetect() เพื่อให้สอดคล้องกับ Impl
    ImpactAnalysisResponse autoDetect(UUID changeRequestId);

    // ✅ ใหม่: ใช้ Traceability Engine
    ImpactAnalysisResponse autoDetectUsingTrace(UUID changeRequestId);

    ImpactAnalysisResponse previewImpact(String targetType, UUID targetId);

    ImpactAnalysisResponse previewImpact(String targetType, UUID targetId, String changeLevel);

    ImpactAnalysisResponse aiAnalyze(UUID changeRequestId);

    ImpactAnalysisResponse aiPreview(AiImpactPreviewRequest request);

    List<ImpactAnalysisHistoryResponse> getHistory(UUID changeRequestId);

    ImpactAnalysisResponse restoreHistory(UUID historyId);

    void delete(UUID id);
}