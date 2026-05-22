package spring.sic.profile.su.su_user_business;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "su_user_business")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SuUserBusinessEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_business_id", length = 100)
    private String userBusinessId;

    @Column(name = "business_role_id")
    private UUID businessRoleId;

    @Column(name = "is_primary")
    private Boolean isPrimary;

    @Column(name = "is_default")
    private Boolean isDefault;

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