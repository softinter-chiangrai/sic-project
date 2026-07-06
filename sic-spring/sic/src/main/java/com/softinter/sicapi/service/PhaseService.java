package com.softinter.sicapi.service;

import java.util.List;
import java.util.UUID;

import com.softinter.sicapi.dto.request.PhaseRequest;
import com.softinter.sicapi.dto.response.PhaseResponse;

public interface PhaseService {
    List<PhaseResponse> getPhasesByProjectId(UUID projectId);
    PhaseResponse getPhaseById(UUID phaseId);
    PhaseResponse createPhase(PhaseRequest request);
    PhaseResponse updatePhase(UUID phaseId, PhaseRequest request);
    void deletePhase(UUID phaseId);
}