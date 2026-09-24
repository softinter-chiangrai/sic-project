package com.softinter.sicapi.dto.request;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import lombok.Data;

@Data
public class AiProjectPipelineRequest {
    private String projectName;
    private String prompt;
    private UUID customerId;
    private LocalDate startDate;
    private Integer durationWeeks;
    private String model;
    private List<AiAttachmentDto> attachments;
    
    // Configurable flags for modules to generate
    private Boolean includeRequirements = true;
    private Boolean includeSpecifications = true;
    private Boolean includeTasks = true;
    private Boolean includeGanttPhases = true;
    private Boolean includeDelivery = true;
    private Boolean includeContract = true;
    private Boolean includeTests = true;
    private Boolean includeManuals = true;
    private Boolean includeInvoices = true;
    private Boolean includeDiagrams = true;
    private Boolean includeDesignReviews = true;
    private Boolean includeMa = true;
}
