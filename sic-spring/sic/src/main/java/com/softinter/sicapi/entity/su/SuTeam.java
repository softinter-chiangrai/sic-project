package com.softinter.sicapi.entity.su;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "su_team")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class SuTeam extends BaseBusinessEntity {

    @Column(name = "team_code", nullable = false, length = 30)
    private String teamCode;

    @Column(name = "team_name_en", nullable = false, length = 255)
    private String teamNameEn;

    @Column(name = "team_name_local", nullable = false, length = 255)
    private String teamNameLocal;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "leader_id", length = 100)
    private String leaderId; // user id จาก Keycloak

    @Column(name = "is_active")
    private Boolean isActive = true;

    @OneToMany(mappedBy = "team", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SuTeamMember> members = new ArrayList<>();
}