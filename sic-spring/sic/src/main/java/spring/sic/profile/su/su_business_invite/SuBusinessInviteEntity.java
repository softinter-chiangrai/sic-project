package spring.sic.profile.su.su_business_invite;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "su_business_invite")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SuBusinessInviteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "role_id")
    private UUID roleId;

    @Column(name = "invite_type", columnDefinition = "TEXT")
    private String inviteType;

    @Column(name = "invite_email", length = 320)
    private String inviteEmail;

    @Column(name = "invite_token", length = 100)
    private String inviteToken;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_date", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdDate;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "updated_date", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime updatedDate;

    @Column(name = "is_delete")
    private Boolean isDelete;

    @Column(name = "delete_by", length = 100)
    private String deleteBy;

    @Column(name = "delete_date", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime deleteDate;
}