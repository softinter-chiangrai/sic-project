package com.softinter.sicapi.controller;

import com.softinter.sicapi.dto.response.HealthResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<HealthResponse> health() {
        HealthResponse response = new HealthResponse();
        response.setService("sic-api");
        response.setStatus("ok");
        response.setUtc(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }
}
