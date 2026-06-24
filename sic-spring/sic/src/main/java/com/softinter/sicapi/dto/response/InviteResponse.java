package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class InviteResponse {
    private UUID id;
    private String inviteType;
    private String inviteEmail;
    private String inviteToken;
    private UUID roleId;
    private String roleCode;
    private String roleName;
    private Boolean isActivated;
    private Integer maxUses;
    private Integer useCount;
    private Instant createdDate;
}