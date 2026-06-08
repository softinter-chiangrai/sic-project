package com.softinter.sicapi.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendVerifyRequest {

    @NotBlank(message = "Recipient is required")
    @Email(message = "Invalid email format")
    private String recipient;  
    
    private String verifyType;  
}