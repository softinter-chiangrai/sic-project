package com.softinter.sicapi.controller.db;

import com.softinter.sicapi.dto.response.*;
import com.softinter.sicapi.repository.db.DbParameterRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/db/parameters")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Parameter", description = "Parameter Management API")
public class DbParameterController {

    private final DbParameterRepository parameterRepository;

    @GetMapping("/lov")
    @Operation(summary = "Get parameter LOV by group")
    public ResponseEntity<ApiResponse<List<LovResponse>>> getLov(@RequestParam String group) {
        List<LovResponse> lov = parameterRepository.findByParamGroupAndIsActiveTrueOrderBySortOrder(group)
                .stream()
                .map(p -> new LovResponse(p.getParamCode(), p.getParamValue()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(lov));
    }
}
