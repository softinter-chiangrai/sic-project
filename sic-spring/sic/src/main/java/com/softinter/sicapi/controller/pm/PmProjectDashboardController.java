package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.response.PmProjectDashboardResponse;
import com.softinter.sicapi.service.PmProjectDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/pm/dashboard")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Project Dashboard", description = "Project summary and stats for dashboard")
@Slf4j
public class PmProjectDashboardController {

    private final PmProjectDashboardService dashboardService;

    @GetMapping("/{projectId}")
    @Operation(summary = "ดึงข้อมูลสรุป Dashboard ของโครงการตาม projectId")
    public ResponseEntity<PmProjectDashboardResponse> getDashboard(@PathVariable UUID projectId) {
        log.info("Getting project dashboard for projectId: {}", projectId);
        UUID businessId = BusinessContextHolder.getBusinessId();
        PmProjectDashboardResponse response = dashboardService.getDashboard(projectId, businessId);
        return ResponseEntity.ok(response);
    }
}
