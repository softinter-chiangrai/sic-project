package com.softinter.sicapi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiPhaseWbsResponse {
    private int milestones;
    private int workPackages;
    private int tasks;
    private String message;
}
