package spring.sic.profile.su.su_business_role;

import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class SuBusinessRoleModel {
    private UUID id;
    private UUID businessId;
    private UUID parentRoleId;
    private String roleCode;
    private String roleNameEn;
    private String roleNameLocal;
    private String roleLevel;
    private Integer sortOrder;
    private Boolean isActive;
    private String createdBy;
    private OffsetDateTime createdDate;
    private String updatedBy;
    private OffsetDateTime updatedDate;
    private Boolean isDelete;
    private String deleteBy;
    private OffsetDateTime deleteDate;
}