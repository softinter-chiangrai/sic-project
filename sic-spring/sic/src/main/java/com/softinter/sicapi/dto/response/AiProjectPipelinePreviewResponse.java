package com.softinter.sicapi.dto.response;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiProjectPipelinePreviewResponse {
    private String projectCode;
    private String projectName;
    private String description;
    private Integer estimatedDurationWeeks;
    
    private List<Map<String, Object>> previewRequirements;
    private List<Map<String, Object>> previewSpecifications;
    private List<Map<String, Object>> previewTasks;
    private List<Map<String, Object>> previewPhases;
    private List<Map<String, Object>> previewDeliveries;
    
    private String message;
}
