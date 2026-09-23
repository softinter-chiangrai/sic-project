package com.softinter.sicapi.dto.response;

import java.util.Map;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiProjectPipelineExecuteResponse {
    private UUID projectId;
    private String projectCode;
    private String projectName;
    private String status;
    private Map<String, Integer> createdCounts;
    private String message;
    private boolean success;
}
