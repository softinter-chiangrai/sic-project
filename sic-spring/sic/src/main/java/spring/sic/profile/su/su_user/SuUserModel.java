package spring.sic.profile.su.su_user;

import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class SuUserModel {
    private UUID id;
    private String keycloakUserId;
    private Boolean isActive;
    private String createdBy;
    private OffsetDateTime createdDate;
    private String updatedBy;
    private OffsetDateTime updatedDate;
    private Boolean isDelete;
    private String deleteBy;
    private OffsetDateTime deleteDate;
}