package com.softinter.sicapi.dto.response;

import lombok.Data;

@Data
public class ProfileActivationResponse {
    private boolean profileComplete;
    private boolean businessActive;
    private String message;
}
