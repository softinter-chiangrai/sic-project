package spring.sic.profile.utils.db_parameter;

import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class DbParameterModel {
    private UUID id;
    private String moduleCode;
    private String parameterCode;
    private String parameterValue;
    private String parameterNameEn;
    private String parameterNameLocal;
    private Boolean isActive;
    private Integer sortOrder;
    private String createdBy;
    private OffsetDateTime createdDate;
    private String updatedBy;
    private OffsetDateTime updatedDate;
    private Boolean isDelete;
    private String deleteBy;
    private OffsetDateTime deleteDate;
}