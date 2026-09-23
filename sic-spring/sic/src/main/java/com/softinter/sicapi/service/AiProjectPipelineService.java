package com.softinter.sicapi.service;

import java.util.UUID;

import com.softinter.sicapi.dto.request.AiProjectPipelineRequest;
import com.softinter.sicapi.dto.response.AiProjectPipelineExecuteResponse;
import com.softinter.sicapi.dto.response.AiProjectPipelinePreviewResponse;

public interface AiProjectPipelineService {
    AiProjectPipelinePreviewResponse generatePreview(AiProjectPipelineRequest request, UUID businessId);
    AiProjectPipelineExecuteResponse executePipeline(AiProjectPipelineRequest request, UUID businessId, String userId);
}
