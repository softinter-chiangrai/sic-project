package spring.sic.profile.su.su_task;

import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class SuTaskModel {
    private UUID id;
    private String taskCode;
    private String taskNameEn;
    private String taskNameLocal;
    private Boolean isActive;
    private String createdBy;
    private OffsetDateTime createdDate;
    private String updatedBy;
    private OffsetDateTime updatedDate;
    private Boolean isDelete;
    private String deleteBy;
    private OffsetDateTime deleteDate;
    private UUID businessId;
}