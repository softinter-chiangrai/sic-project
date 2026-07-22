package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.SaveImpactAnalysisRequest;
import com.softinter.sicapi.dto.response.ImpactAnalysisResponse;

import java.util.UUID;

public interface ImpactAnalysisService {

    ImpactAnalysisResponse getByChangeRequest(UUID changeRequestId);

    UUID save(SaveImpactAnalysisRequest request);

    // ✅ เพิ่ม method autoDetect() เพื่อให้สอดคล้องกับ Impl
    ImpactAnalysisResponse autoDetect(UUID changeRequestId);

    // ✅ ใหม่: ใช้ Traceability Engine
    ImpactAnalysisResponse autoDetectUsingTrace(UUID changeRequestId);

    void delete(UUID id);
}