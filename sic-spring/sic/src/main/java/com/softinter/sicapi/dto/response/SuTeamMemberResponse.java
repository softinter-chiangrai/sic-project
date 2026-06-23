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
public class SuTeamMemberResponse {
    private UUID id;
    private UUID teamId;
    private String userId;
    private String userName;
    private String userEmail;
    private String roleInTeam;
    private Boolean isActive;
    private Instant joinedDate;
}