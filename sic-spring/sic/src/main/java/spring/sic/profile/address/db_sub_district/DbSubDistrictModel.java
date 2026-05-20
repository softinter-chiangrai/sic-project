package spring.sic.profile.address.db_sub_district;

import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class DbSubDistrictModel {
    private UUID id;
    private UUID subDistrictId;
    private String subDistrictCode;
    private String subDistrictNameEn;
    private String subDistrictNameLocal;
    private String zipCode;
    private Long latitude;
    private Long longitude;
    private Boolean isActive;
    private String createdBy;
    private OffsetDateTime createdDate;
    private String updatedBy;
    private OffsetDateTime updatedDate;
    private Boolean isDelete;
    private String deleteBy;
    private OffsetDateTime deleteDate;
}