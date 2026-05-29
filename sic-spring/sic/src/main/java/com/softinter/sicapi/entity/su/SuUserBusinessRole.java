package com.softinter.sicapi.entity.su;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "su_user_business_role",
       indexes = {
           @Index(name = "idx_user_business_role", columnList = "user_business_id, business_role_id", unique = true)
       })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class SuUserBusinessRole extends BaseEntity {

    @Column(name = "user_business_id", insertable = false, updatable = false)
    private UUID userBusinessId;

    @Column(name = "business_role_id", insertable = false, updatable = false)
    private UUID businessRoleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_business_id", nullable = false)
    private SuUserBusiness userBusiness;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_role_id", nullable = false)
    private SuBusinessRole businessRole;

    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary = false;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = false;
}