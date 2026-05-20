package spring.sic.profile.su.su_business_invite;

import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class SuBusinessInviteModel {
    private UUID id;
    private UUID roleId;
    private String inviteType;
    private String inviteEmail;
    private String inviteToken;
    private Boolean isActive;
    private String createdBy;
    private OffsetDateTime createdDate;
    private String updatedBy;
    private OffsetDateTime updatedDate;
    private Boolean isDelete;
    private String deleteBy;
    private OffsetDateTime deleteDate;
}