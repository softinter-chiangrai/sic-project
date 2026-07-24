package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.entity.enums.TraceRelationship;   // ✅ import enum
import com.softinter.sicapi.entity.pm.PmTraceLink;
import com.softinter.sicapi.service.TraceLinkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/trace")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Trace Link", description = "Traceability Link Management")
public class TraceLinkController {

    private final TraceLinkService traceLinkService;

    @PostMapping("/links")
    @Operation(summary = "Create a trace link")
    public ResponseEntity<PmTraceLink> createLink(@RequestBody Map<String, Object> request) {
        UUID projectId = UUID.fromString((String) request.get("projectId"));
        String sourceType = (String) request.get("sourceType");
        UUID sourceId = UUID.fromString((String) request.get("sourceId"));
        String targetType = (String) request.get("targetType");
        UUID targetId = UUID.fromString((String) request.get("targetId"));
        
        // ✅ แปลง String เป็น Enum
        String relationshipTypeStr = (String) request.get("relationshipType");
        TraceRelationship relationshipType = TraceRelationship.valueOf(relationshipTypeStr);

        PmTraceLink link = traceLinkService.createLink(
            projectId, sourceType, sourceId, targetType, targetId, relationshipType
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(link);
    }

    @GetMapping("/links/source/{sourceType}/{sourceId}")
    @Operation(summary = "Get links by source")
    public ResponseEntity<List<PmTraceLink>> getLinksBySource(
            @PathVariable String sourceType,
            @PathVariable UUID sourceId) {
        return ResponseEntity.ok(traceLinkService.getLinksBySource(sourceType, sourceId));
    }

    @GetMapping("/links/target/{targetType}/{targetId}")
    @Operation(summary = "Get links by target")
    public ResponseEntity<List<PmTraceLink>> getLinksByTarget(
            @PathVariable String targetType,
            @PathVariable UUID targetId) {
        return ResponseEntity.ok(traceLinkService.getLinksByTarget(targetType, targetId));
    }

    @GetMapping("/trace/{sourceType}/{sourceId}")
    @Operation(summary = "Get full trace (recursive)")
    public ResponseEntity<List<PmTraceLink>> getFullTrace(
            @PathVariable String sourceType,
            @PathVariable UUID sourceId) {
        return ResponseEntity.ok(traceLinkService.getFullTrace(sourceType, sourceId));
    }

    @DeleteMapping("/links/{linkId}")
    @Operation(summary = "Delete a trace link")
    public ResponseEntity<Void> deleteLink(@PathVariable UUID linkId) {
        traceLinkService.deleteLink(linkId);
        return ResponseEntity.noContent().build();
    }
}