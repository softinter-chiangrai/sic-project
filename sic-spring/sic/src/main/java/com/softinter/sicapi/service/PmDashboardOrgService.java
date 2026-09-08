package com.softinter.sicapi.service;

import java.util.List;
import java.util.UUID;

import com.softinter.sicapi.dto.response.DashboardDeadlineResponse;
import com.softinter.sicapi.dto.response.DashboardProjectHealthResponse;
import com.softinter.sicapi.dto.response.DashboardSummaryResponse;

public interface PmDashboardOrgService {

    DashboardSummaryResponse getSummary(UUID businessId);

    List<DashboardDeadlineResponse> getUpcomingDeadlines(UUID businessId, int limit);

    List<DashboardProjectHealthResponse> getAtRiskProjects(UUID businessId, int limit);
}
