package spring.sic.profile.address.db_province;

import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class DbProvinceModel {
    private UUID id;
    private UUID provinceId;
    private String districtCode;
    private String provinceNameEn;
    private String provinceNameLocal;
    private Boolean isActive;
    private String createdBy;
    private OffsetDateTime createdDate;
    private String updatedBy;
    private OffsetDateTime updatedDate;
    private Boolean isDelete;
    private String deleteBy;
    private OffsetDateTime deleteDate;
}