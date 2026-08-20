package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.request.PmTestCaseRequest;
import com.softinter.sicapi.dto.response.PmTestCaseResponse;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.PmTestCaseService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/pm/test-cases")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "PM Test Case", description = "PM Test Case Management API")
public class PmTestCaseController {

    private final PmTestCaseService testCaseService;
    private final com.softinter.sicapi.service.impl.TestCaseGeneratorService generatorService;
    private final CurrentUserService currentUserService;

    @GetMapping("/paging")
    public ResponseEntity<Page<PmTestCaseResponse>> getPaging(
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        UUID businessId = BusinessContextHolder.getBusinessId();
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(testCaseService.findAll(businessId, projectId, keyword, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PmTestCaseResponse> getById(@PathVariable UUID id) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        return ResponseEntity.ok(testCaseService.findById(id, businessId));
    }

    @PostMapping("/save")
    public ResponseEntity<UUID> save(@RequestBody PmTestCaseRequest request) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        String userId = currentUserService.getUserId();
        return ResponseEntity.ok(testCaseService.save(request, businessId, userId));
    }

    @PostMapping("/generate/draft")
    public ResponseEntity<com.softinter.sicapi.dto.response.TestCaseDraftResponse> generateDraft(
            @RequestBody(required = false) com.softinter.sicapi.dto.request.GenerateTestCaseDraftRequest request) {
        com.softinter.sicapi.dto.request.GenerateTestCaseDraftRequest req = request != null ? request : new com.softinter.sicapi.dto.request.GenerateTestCaseDraftRequest();
        return ResponseEntity.ok(generatorService.generateDraft(req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        String userId = currentUserService.getUserId();
        testCaseService.delete(id, businessId, userId);
        return ResponseEntity.noContent().build();
    }
}
