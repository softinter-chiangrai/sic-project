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
public class SuUserBusinessMemberResponse {
    private UUID id;
    private UUID businessId;
    private String userId;
    private String userName;
    private String userEmail;
    private String roleCode;
    private String roleName;
    private Boolean isActive;
    private Boolean isDefault;
    private Instant createdDate;
}