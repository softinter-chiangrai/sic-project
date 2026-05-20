package spring.sic.profile.su.su_message;

import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class SuMessageModel {
    private UUID id;
    private String moduleCode;
    private String programCode;
    private String messageCode;
    private String messageEn;
    private String messageLocal;
    private Boolean isActive;
    private String createdBy;
    private OffsetDateTime createdDate;
    private String updatedBy;
    private OffsetDateTime updatedDate;
    private Boolean isDelete;
    private String deleteBy;
    private OffsetDateTime deleteDate;
}