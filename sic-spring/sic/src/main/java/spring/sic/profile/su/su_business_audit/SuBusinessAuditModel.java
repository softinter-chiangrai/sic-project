package spring.sic.profile.su.su_business_audit;

import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class SuBusinessAuditModel {
    private UUID id;
    private String keycloakUserId;
    private String username;
    private UUID businessId;
    private String clientIp;
    private String remark;
    private String createdBy;
    private OffsetDateTime createdDate;
    private String updatedBy;
    private OffsetDateTime updatedDate;
    private Boolean isDelete;
    private String deleteBy;
    private OffsetDateTime deleteDate;
}