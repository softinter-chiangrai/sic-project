package spring.sic.profile.su.su_program;

import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class SuProgramModel {
    private UUID id;
    private UUID parentProgramId;
    private String programCode;
    private String icon;
    private String nameEn;
    private String nameLocal;
    private String routePath;
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