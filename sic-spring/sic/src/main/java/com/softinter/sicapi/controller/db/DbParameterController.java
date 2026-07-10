package com.softinter.sicapi.controller.db;

import com.softinter.sicapi.dto.response.LovResponse;
import com.softinter.sicapi.entity.db.DbParameter;
import com.softinter.sicapi.repository.db.DbParameterRepository;
import com.softinter.sicapi.util.LocalizationHelper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/db/parameter")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Parameter", description = "Parameter Management API")
public class DbParameterController {

    private final DbParameterRepository parameterRepository;

    @GetMapping("/lov")
    @Operation(summary = "Get parameter LOV by group and optional parameterCode")
    public ResponseEntity<List<LovResponse>> getLov(
            @RequestParam(required = false, defaultValue = "COMMON") String group,
            @RequestParam(required = false) String parameterCode) {
        List<DbParameter> params;
        if (parameterCode != null && !parameterCode.isBlank()) {
            params = parameterRepository.findByModuleCodeAndParameterCodeAndIsActiveTrueOrderBySortOrder(group, parameterCode);
        } else {
            params = parameterRepository.findByModuleCodeAndIsActiveTrueOrderBySortOrder(group);
        }
        List<LovResponse> lov = params.stream()
                .map(p -> new LovResponse(p.getParameterValue(), LocalizationHelper.getParameterName(p)))
                .collect(Collectors.toList());
        return ResponseEntity.ok(lov);
    }
}