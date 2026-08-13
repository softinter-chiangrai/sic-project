package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.PmTestScenarioRequest;
import com.softinter.sicapi.dto.response.PmTestScenarioResponse;

import java.util.List;
import java.util.UUID;

public interface PmTestScenarioService {

    List<PmTestScenarioResponse> findByProject(UUID businessId, UUID projectId);

    PmTestScenarioResponse findById(UUID id, UUID businessId);

    UUID save(PmTestScenarioRequest request, UUID businessId, String userId);

    void delete(UUID id, UUID businessId, String userId);
}
