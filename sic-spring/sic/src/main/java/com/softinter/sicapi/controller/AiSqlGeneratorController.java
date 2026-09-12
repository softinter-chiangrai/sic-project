package com.softinter.sicapi.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.softinter.sicapi.dto.request.AiGenerateSqlRequest;
import com.softinter.sicapi.dto.response.AiGenerateSqlResponse;
import com.softinter.sicapi.entity.pm.PmDiagramSqlHistory;
import com.softinter.sicapi.service.AiSqlGeneratorService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
public class AiSqlGeneratorController {

    private final AiSqlGeneratorService aiSqlGeneratorService;

    @PostMapping("/generate-sql-from-er")
    public ResponseEntity<AiGenerateSqlResponse> generateSqlFromEr(@RequestBody AiGenerateSqlRequest request) {
        try {
            log.info("Generating SQL with AI for page: {}, mode: {}, vendor: {}, tabId: {}", 
                    request.getPageName(), request.getMode(), request.getVendor(), request.getTabId());
            AiGenerateSqlResponse response = aiSqlGeneratorService.processAndSaveSql(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("AI SQL generation failed", e);
            AiGenerateSqlResponse errorResponse = new AiGenerateSqlResponse();
            errorResponse.setSql("");
            errorResponse.setMessage("Failed to generate SQL: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/sql-history/{tabId}")
    public ResponseEntity<List<PmDiagramSqlHistory>> getSqlHistory(@PathVariable String tabId) {
        try {
            List<PmDiagramSqlHistory> history = aiSqlGeneratorService.getHistoryByTabId(tabId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            log.error("Failed to fetch SQL history for tab: {}", tabId, e);
            return ResponseEntity.internalServerError().body(List.of());
        }
    }
}