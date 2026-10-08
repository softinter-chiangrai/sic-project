package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.request.PmTestCaseRequest;
import com.softinter.sicapi.dto.response.PaginationResponse;
import com.softinter.sicapi.dto.response.PmTestCaseResponse;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.PmTestCaseService;
import com.softinter.sicapi.util.PaginationUtil;
import com.softinter.sicapi.util.SortValidator;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import com.softinter.sicapi.dto.request.GenerateTestCaseDraftRequest;
import com.softinter.sicapi.entity.pm.PmTestCase;
import com.softinter.sicapi.service.PmUatExportService;
import com.softinter.sicapi.util.ReportHelper;
import com.softinter.sicapi.dto.response.TestCaseDraftResponse;
import com.softinter.sicapi.service.impl.TestCaseGeneratorService;

@Slf4j
@RestController
@RequestMapping("/api/pm/test-cases")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "PM Test Case", description = "PM Test Case Management API")
public class PmTestCaseController {

    private final PmTestCaseService testCaseService;
    private final TestCaseGeneratorService generatorService;
    private final PmUatExportService uatExportService;
    private final CurrentUserService currentUserService;

    @GetMapping("/export-uat-report")
    public ResponseEntity<byte[]> exportUatReport(
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false, defaultValue = "UAT") String testType,
            @RequestParam(required = false) UUID scenarioId,
            @RequestParam(required = false) String lang,
            @RequestHeader(value = "x-language-code", required = false) String headerLang) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        String finalLang = ReportHelper.resolveLang(lang, headerLang);
        byte[] pdfBytes = uatExportService.exportUatReportPdf(projectId, businessId, testType, scenarioId, finalLang);
        String filename = "uat-report-" + (scenarioId != null ? "scenario-" + scenarioId : (projectId != null ? projectId : "all")) + ".pdf";
        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                .body(pdfBytes);
    }

    @GetMapping("/paging")
    public ResponseEntity<PaginationResponse<PmTestCaseResponse>> getPaging(
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        UUID businessId = BusinessContextHolder.getBusinessId();
        Sort sort = SortValidator.build(PmTestCase.class, sortBy, sortDirection, "createdDate");
        Pageable pageable = PaginationUtil.toPageable(page, size, sort);
        Page<PmTestCaseResponse> pageResult = testCaseService.findAll(businessId, projectId, keyword, pageable);
        return ResponseEntity.ok(PaginationUtil.of(pageResult));
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
    public ResponseEntity<TestCaseDraftResponse> generateDraft(
            @RequestBody(required = false) GenerateTestCaseDraftRequest request) {
        GenerateTestCaseDraftRequest req = request != null ? request : new GenerateTestCaseDraftRequest();
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
