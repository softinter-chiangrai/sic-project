package com.softinter.sicapi.entity.su;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "su_business_audit")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class SuBusinessAudit extends BaseEntity {

    @Column(name = "user_id", nullable = false, length = 100)
    private String userId;

    @Column(name = "session_id", length = 100)
    private String sessionId;

    @Column(name = "username", length = 100)
    private String username;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private SuBusiness business;

    @Column(name = "client_ip", length = 50)
    private String clientIp;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = false;

    @Column(name = "remark", length = 500)
    private String remark;
}