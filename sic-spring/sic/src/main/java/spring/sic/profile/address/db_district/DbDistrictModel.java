package spring.sic.profile.address.db_district;

import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class DbDistrictModel {
    private UUID id;
    private UUID districtId;
    private UUID provinceId;
    private String districtCode;
    private String districtNameEn;
    private String districtNameLocal;
    private Boolean isActive;
    private String createdBy;
    private OffsetDateTime createdDate;
    private String updatedBy;
    private OffsetDateTime updatedDate;
    private Boolean isDelete;
    private String deleteBy;
    private OffsetDateTime deleteDate;
}