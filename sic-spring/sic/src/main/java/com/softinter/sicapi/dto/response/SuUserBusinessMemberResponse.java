package com.softinter.sicapi.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private List<String> roleIds;      
    private List<String> roleNames;
    private Boolean isActive;
    private Boolean isDefault;
    private Instant createdDate;
    private UUID roleId;
}