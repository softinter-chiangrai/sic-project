package com.softinter.sicapi.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateMaTicketDraftRequest {
    private UUID projectId;
    private String title;
    private String ticketType;
    private String severity;
    private String prompt;
    private String model;
}
