package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.request.PmTestScenarioRequest;
import com.softinter.sicapi.dto.response.ComboboxResponse;
import com.softinter.sicapi.dto.response.PmTestScenarioResponse;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.PmTestScenarioService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/pm/test-scenarios")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "PM Test Scenario", description = "PM Test Scenario Management API")
public class PmTestScenarioController {

    private final PmTestScenarioService scenarioService;
    private final com.softinter.sicapi.service.impl.TestScenarioGeneratorService generatorService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public ResponseEntity<List<PmTestScenarioResponse>> getByProject(@RequestParam(required = false) UUID projectId) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        return ResponseEntity.ok(scenarioService.findByProject(businessId, projectId));
    }

    @GetMapping("/combobox")
    public ResponseEntity<List<ComboboxResponse>> getCombobox(@RequestParam(required = false) UUID projectId) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        List<PmTestScenarioResponse> scenarios = scenarioService.findByProject(businessId, projectId);
        List<ComboboxResponse> list = scenarios.stream()
                .map(s -> new ComboboxResponse(s.getId().toString(), s.getScenarioName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PmTestScenarioResponse> getById(@PathVariable UUID id) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        return ResponseEntity.ok(scenarioService.findById(id, businessId));
    }

    @PostMapping("/save")
    public ResponseEntity<UUID> save(@RequestBody PmTestScenarioRequest request) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        String userId = currentUserService.getUserId();
        return ResponseEntity.ok(scenarioService.save(request, businessId, userId));
    }

    @PostMapping("/generate/draft")
    public ResponseEntity<com.softinter.sicapi.dto.response.TestScenarioDraftResponse> generateDraft(
            @RequestBody(required = false) com.softinter.sicapi.dto.request.GenerateTestScenarioDraftRequest request) {
        com.softinter.sicapi.dto.request.GenerateTestScenarioDraftRequest req = request != null ? request : new com.softinter.sicapi.dto.request.GenerateTestScenarioDraftRequest();
        return ResponseEntity.ok(generatorService.generateDraft(req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        String userId = currentUserService.getUserId();
        scenarioService.delete(id, businessId, userId);
        return ResponseEntity.noContent().build();
    }
}
