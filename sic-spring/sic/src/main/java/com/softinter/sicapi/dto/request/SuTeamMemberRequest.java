package com.softinter.sicapi.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuTeamMemberRequest {
    private UUID teamId;
    @NotBlank(message = "กรุณาระบุ user id")
    private String userId;
    private String roleInTeam;
    private Boolean isActive = true;
}