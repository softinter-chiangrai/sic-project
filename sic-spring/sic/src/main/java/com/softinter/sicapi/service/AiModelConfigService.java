package com.softinter.sicapi.service;

import java.util.List;
import java.util.UUID;

import com.softinter.sicapi.dto.request.SaveAiModelConfigRequest;
import com.softinter.sicapi.dto.response.AiModelConfigResponse;

public interface AiModelConfigService {
    List<AiModelConfigResponse> getAll();
    AiModelConfigResponse getById(UUID id);
    AiModelConfigResponse save(SaveAiModelConfigRequest request);
    void delete(UUID id);
}
