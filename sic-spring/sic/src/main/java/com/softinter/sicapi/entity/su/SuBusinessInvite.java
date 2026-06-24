package com.softinter.sicapi.entity.su;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "su_business_invite")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class SuBusinessInvite extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private SuBusinessRole suBusinessRole;

    @Column(name = "invite_type", nullable = false, length = 50)
    private String inviteType;

    @Column(name = "invite_email", length = 320)
    private String inviteEmail;

    @Column(name = "invite_token", length = 300)
    private String inviteToken;

    @Column(name = "is_activated", nullable = false)
    private Boolean isActivated = false;

    // ✅ เพิ่ม field นี้ (มีในฐานข้อมูลแล้ว)
    @Column(name = "max_uses")
    private Integer maxUses;

    // ✅ เพิ่ม field นี้ (มีในฐานข้อมูลแล้ว)
    @Column(name = "use_count")
    private Integer useCount = 0;
}