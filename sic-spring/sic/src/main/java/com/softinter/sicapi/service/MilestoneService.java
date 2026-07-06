package com.softinter.sicapi.service;


import java.util.List;
import java.util.UUID;

import com.softinter.sicapi.dto.request.MilestoneRequest;
import com.softinter.sicapi.dto.response.MilestoneResponse;

public interface MilestoneService {
    List<MilestoneResponse> getMilestonesByPhaseId(UUID phaseId);
    MilestoneResponse getMilestoneById(UUID milestoneId);
    MilestoneResponse createMilestone(MilestoneRequest request);
    MilestoneResponse updateMilestone(UUID milestoneId, MilestoneRequest request);
    void deleteMilestone(UUID milestoneId);
}