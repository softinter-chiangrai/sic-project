package com.softinter.sicapi.controller.pm;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.response.DashboardDeadlineResponse;
import com.softinter.sicapi.dto.response.DashboardProjectHealthResponse;
import com.softinter.sicapi.dto.response.DashboardSummaryResponse;
import com.softinter.sicapi.dto.response.PmProjectDashboardResponse;
import com.softinter.sicapi.service.PmDashboardOrgService;
import com.softinter.sicapi.service.PmProjectDashboardService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/pm/dashboard")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Project Dashboard", description = "Project summary and stats for dashboard")
@Slf4j
public class PmProjectDashboardController {

    private final PmProjectDashboardService dashboardService;
    private final PmDashboardOrgService orgDashboardService;

    @GetMapping("/org/summary")
    @Operation(summary = "ดึงข้อมูลสรุปภาพรวมทั้งองค์กร (ทุกโครงการ) สำหรับหน้า Dashboard")
    public ResponseEntity<DashboardSummaryResponse> getOrgSummary() {
        UUID businessId = BusinessContextHolder.getBusinessId();
        return ResponseEntity.ok(orgDashboardService.getSummary(businessId));
    }

    @GetMapping("/org/deadlines")
    @Operation(summary = "ดึงรายการงานที่ใกล้/เลยกำหนดส่งทั่วทั้งองค์กร")
    public ResponseEntity<List<DashboardDeadlineResponse>> getOrgDeadlines(
            @RequestParam(defaultValue = "10") int limit) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        return ResponseEntity.ok(orgDashboardService.getUpcomingDeadlines(businessId, limit));
    }

    @GetMapping("/org/project-health")
    @Operation(summary = "ดึงรายชื่อโครงการที่มีความเสี่ยงสูงสุด (เรียงคะแนนสุขภาพจากต่ำไปสูง)")
    public ResponseEntity<List<DashboardProjectHealthResponse>> getOrgProjectHealth(
            @RequestParam(defaultValue = "5") int limit) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        return ResponseEntity.ok(orgDashboardService.getAtRiskProjects(businessId, limit));
    }

    @GetMapping("/{projectId}")
    @Operation(summary = "ดึงข้อมูลสรุป Dashboard ของโครงการตาม projectId")
    public ResponseEntity<PmProjectDashboardResponse> getDashboard(@PathVariable UUID projectId) {
        log.info("Getting project dashboard for projectId: {}", projectId);
        UUID businessId = BusinessContextHolder.getBusinessId();
        PmProjectDashboardResponse response = dashboardService.getDashboard(projectId, businessId);
        return ResponseEntity.ok(response);
    }
}
