package com.softinter.sicapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateInviteRequest {
    private UUID id; // for update
    @NotNull(message = "Role ID is required")   // ✅ เปลี่ยนเป็น @NotNull
    private UUID roleId;
    @NotBlank(message = "Invite type is required")
    private String inviteType; // "email" or "token"
    private String inviteEmail;
    private Integer maxUses;
}