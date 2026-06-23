package com.softinter.sicapi.entity.su;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "su_team_member")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class SuTeamMember extends BaseEntity {

    @Column(name = "team_id", insertable = false, updatable = false)
    private UUID teamId;

    @Column(name = "user_id", nullable = false, length = 100)
    private String userId;

    @Column(name = "role_in_team", length = 50)
    private String roleInTeam;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "joined_date")
    private Instant joinedDate = Instant.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private SuTeam team;
}