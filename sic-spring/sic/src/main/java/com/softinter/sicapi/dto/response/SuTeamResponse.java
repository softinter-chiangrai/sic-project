package com.softinter.sicapi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuTeamResponse {
    private UUID id;
    private UUID businessId;
    private String teamCode;
    private String teamNameEn;
    private String teamNameLocal;
    private String description;
    private String leaderId;
    private Boolean isActive;
    private Instant createdDate;
    private Instant updatedDate;
}