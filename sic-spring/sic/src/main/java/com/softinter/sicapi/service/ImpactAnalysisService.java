// src/main/java/com/softinter/sicapi/service/ImpactAnalysisService.java
package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.SaveImpactAnalysisRequest;
import com.softinter.sicapi.dto.response.ImpactAnalysisResponse;

import java.util.UUID;

public interface ImpactAnalysisService {

    ImpactAnalysisResponse getByChangeRequest(UUID changeRequestId);

    UUID save(SaveImpactAnalysisRequest request);

    ImpactAnalysisResponse autoDetect(UUID changeRequestId);

    void delete(UUID id);
}