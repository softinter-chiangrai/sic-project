package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.impl.DocumentLivePreviewService;
import com.softinter.sicapi.util.ReportHelper;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Live preview of a document form: POST /api/pm/live-preview/{kind}?lang=th with the form (same shape as its save) returns
 * the real Jasper PDF of those values. Nothing is stored. kind: requirement, specification, contract, design-review,
 * change-request, ma-ticket, delivery, user-manual, invoice.
 */
@RestController
@RequestMapping("/api/pm/live-preview")
@RequiredArgsConstructor
public class DocumentLivePreviewController {

    private final DocumentLivePreviewService previewService;
    private final CurrentUserService currentUserService;

    @PostMapping("/{kind}")
    @Operation(summary = "Real PDF of unsaved document form values")
    public ResponseEntity<byte[]> preview(
            @PathVariable String kind,
            @RequestBody Map<String, Object> form,
            @RequestParam(required = false) String lang,
            @RequestHeader(value = "x-language-code", required = false) String headerLang) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null || !previewService.supports(kind)) {
            return ResponseEntity.badRequest().build();
        }
        byte[] pdf = previewService.preview(kind, form, businessId, currentUserService.getUserId(), ReportHelper.resolveLang(lang, headerLang));
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.inline().filename("preview.pdf").build());
        headers.setCacheControl("no-store");
        return ResponseEntity.ok().headers(headers).body(pdf);
    }
}
