package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.dto.response.ComboboxResponse;
import com.softinter.sicapi.service.PmCustomerContractService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pm/contracts")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "PmCustomerContract", description = "API สำหรับสัญญาลูกค้า")
public class PmCustomerContractController {

    private final PmCustomerContractService contractService;

    @GetMapping("/combobox")
    @Operation(summary = "ดึงสัญญาสำหรับ Combobox")
    public ResponseEntity<List<ComboboxResponse>> getCombobox(
            @RequestParam(required = false) UUID customerId) {
        return ResponseEntity.ok(contractService.getComboboxContracts(customerId));
    }
}