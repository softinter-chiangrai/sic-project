package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class AuthMeResponse {
    private String userId;
    private String username;
    private String email;
    private List<String> roles;
    private UUID currentBusinessId;
    private String currentBusinessName;
    private String displayName;
}
