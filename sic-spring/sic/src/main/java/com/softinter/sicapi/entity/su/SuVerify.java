package com.softinter.sicapi.entity.su;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "su_verify")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class SuVerify extends BaseEntity {

    @Column(name = "verify_type", nullable = false, length = 100)
    private String verifyType;

    @Column(name = "reference_number", nullable = false, length = 300)
    private String referenceNumber;

    @Column(name = "token", nullable = false, length = 300)
    private String token;

    @Column(name = "max_retry", nullable = false)
    private Integer maxRetry = 5;

    @Column(name = "retry_count", nullable = false)
    private Integer retryCount = 0;

    @Column(name = "expire_at", nullable = false)
    private Instant expireAt;

    @Column(name = "recipient", nullable = false, length = 255)
    private String recipient;
    
}