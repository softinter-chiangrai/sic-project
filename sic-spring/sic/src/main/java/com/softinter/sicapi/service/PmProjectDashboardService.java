package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.response.PmProjectDashboardResponse;

import java.util.UUID;

public interface PmProjectDashboardService {
    PmProjectDashboardResponse getDashboard(UUID projectId, UUID businessId);
}
