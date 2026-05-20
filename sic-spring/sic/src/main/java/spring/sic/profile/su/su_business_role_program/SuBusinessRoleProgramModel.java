package spring.sic.profile.su.su_business_role_program;

import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class SuBusinessRoleProgramModel {
    private UUID id;
    private UUID businessRoleId;
    private UUID programId;
    private Boolean isActive;
    private String createdBy;
    private OffsetDateTime createdDate;
    private String updatedBy;
    private OffsetDateTime updatedDate;
    private Boolean isDelete;
    private String deleteBy;
    private OffsetDateTime deleteDate;
}