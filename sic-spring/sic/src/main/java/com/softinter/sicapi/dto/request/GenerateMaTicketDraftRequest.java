package com.softinter.sicapi.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateMaTicketDraftRequest implements AiDraftRequest {
    private UUID projectId;
    private String title;
    private String ticketType;
    private String severity;
    private String prompt;
    private String model;
    private List<AiAttachmentDto> attachments;
}
