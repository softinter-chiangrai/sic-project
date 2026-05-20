package spring.sic.profile.su.su_user_business_role;


import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class SuUserBusinessRoleModel {
    private UUID id;
    private UUID userBusinessId;
    private UUID businessRoleId;
    private Boolean isPrimary;
    private Boolean isActive;
    private String createdBy;
    private OffsetDateTime createdDate;
    private String updatedBy;
    private OffsetDateTime updatedDate;
    private Boolean isDelete;
    private String deleteBy;
    private OffsetDateTime deleteDate;
}