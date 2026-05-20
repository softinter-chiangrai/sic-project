package spring.sic.profile.su.su_user_business;

import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class SuUserBusinessModel {
    private UUID id;
    private String userBusinessId;
    private UUID businessRoleId;
    private Boolean isPrimary;
    private Boolean isDefault;
    private Boolean isActive;
    private String createdBy;
    private OffsetDateTime createdDate;
    private String updatedBy;
    private OffsetDateTime updatedDate;
    private Boolean isDelete;
    private String deleteBy;
    private OffsetDateTime deleteDate;
}