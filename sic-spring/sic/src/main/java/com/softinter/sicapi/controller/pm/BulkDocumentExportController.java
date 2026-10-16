package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.service.impl.BulkDocumentExportService;
import com.softinter.sicapi.util.ReportHelper;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

/**
 * POST /api/pm/export/bulk {kind, ids} - the documents ticked in a list page: one PDF, or several as one book with a table of
 * contents and running page numbers.
 */
@RestController
@RequestMapping("/api/pm/export")
@RequiredArgsConstructor
public class BulkDocumentExportController {

    private final BulkDocumentExportService bulkExport;

    public record BulkExportRequest(String kind, List<UUID> ids) {
    }

    @PostMapping("/bulk")
    @Operation(summary = "Print the selected documents as one PDF")
    public ResponseEntity<byte[]> bulk(
            @RequestBody BulkExportRequest request,
            @RequestParam(required = false) String lang,
            @RequestHeader(value = "x-language-code", required = false) String headerLang) throws Exception {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null || request == null || !bulkExport.supports(request.kind())) {
            return ResponseEntity.badRequest().build();
        }
        var result = bulkExport.export(request.kind(), request.ids(), businessId, ReportHelper.resolveLang(lang, headerLang));
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.inline().filename(result.fileName(), StandardCharsets.UTF_8).build());
        return ResponseEntity.ok().headers(headers).body(result.bytes());
    }
}
