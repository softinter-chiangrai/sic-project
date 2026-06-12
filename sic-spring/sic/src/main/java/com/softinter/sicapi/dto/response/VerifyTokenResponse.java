// VerifyTokenResponse.java
package com.softinter.sicapi.dto.response;

import lombok.Data;
import java.time.Instant;

@Data
public class VerifyTokenResponse {
    private String verifyType;             
    private String referenceNumber;   
    private Integer expirationMinutes; 
    private Integer maxRetry;          
    private String recipient;          
    private Boolean valid;             
    private Instant expiresAt;         
    private String message;            
}