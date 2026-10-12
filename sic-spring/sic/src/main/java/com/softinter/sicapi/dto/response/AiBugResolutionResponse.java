package com.softinter.sicapi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiBugResolutionResponse {

    private String rootCause;
    private String suggestedFix;
    private String preventionTest;
    private String recommendedSeverity; // LOW, MEDIUM, HIGH, CRITICAL
    private int confidenceScore; // 0 - 100
    private String codeSnippet;
    private String lang; // 'th' or 'en'
}
