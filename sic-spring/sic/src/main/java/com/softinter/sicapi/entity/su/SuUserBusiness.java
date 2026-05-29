package com.softinter.sicapi.entity.su;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "su_user_business",
       indexes = {
           @Index(name = "idx_user_business", columnList = "user_id, business_id", unique = true)
       })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class SuUserBusiness extends BaseEntity {

    @Column(name = "user_id", nullable = false, length = 100)
    private String userId;

    @Column(name = "business_id", insertable = false, updatable = false)
    private UUID businessId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private SuBusiness business;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = false;

    @OneToMany(mappedBy = "userBusiness", fetch = FetchType.LAZY)
    private List<SuUserBusinessRole> userBusinessRoles = new ArrayList<>();
}