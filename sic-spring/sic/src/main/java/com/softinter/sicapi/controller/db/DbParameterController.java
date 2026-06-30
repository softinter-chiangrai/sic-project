package com.softinter.sicapi.controller.db;

import com.softinter.sicapi.dto.response.LovResponse;
import com.softinter.sicapi.repository.db.DbParameterRepository;
import com.softinter.sicapi.util.LocalizationHelper;  // ✅ เพิ่ม
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
    @Operation(summary = "Get parameter LOV by group")
    public ResponseEntity<List<LovResponse>> getLov(@RequestParam(required = false, defaultValue = "COMMON") String group) {
        List<LovResponse> lov = parameterRepository.findByModuleCodeAndIsActiveTrueOrderBySortOrder(group)
                .stream()
                .map(p -> new LovResponse(
                        p.getParameterCode(),
                        LocalizationHelper.getParameterName(p)  // ✅ แก้
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(lov);
    }
}