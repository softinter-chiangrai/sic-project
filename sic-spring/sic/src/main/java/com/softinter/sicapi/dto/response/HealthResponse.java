package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class HealthResponse {
    private String service;
    private String status;
    private LocalDateTime utc;
}
