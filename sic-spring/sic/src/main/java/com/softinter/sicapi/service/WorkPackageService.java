package com.softinter.sicapi.service;


import java.util.List;
import java.util.UUID;

import com.softinter.sicapi.dto.request.WorkPackageRequest;
import com.softinter.sicapi.dto.response.WorkPackageResponse;

public interface WorkPackageService {
    List<WorkPackageResponse> getWorkPackagesByMilestoneId(UUID milestoneId);
    WorkPackageResponse getWorkPackageById(UUID wpId);
    WorkPackageResponse createWorkPackage(WorkPackageRequest request);
    WorkPackageResponse updateWorkPackage(UUID wpId, WorkPackageRequest request);
    void deleteWorkPackage(UUID wpId);
}