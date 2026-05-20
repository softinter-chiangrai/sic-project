package spring.sic.profile.address.db_country;

import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class DbCountryModel {
    private UUID id;
    private String countryCode;
    private String isoCode;
    private String countryNameEn;
    private String countryNameLocal;
    private Boolean supportLocalAddress;
    private Boolean isActive;
    private String createdBy;
    private OffsetDateTime createdDate;
    private String updatedBy;
    private OffsetDateTime updatedDate;
    private Boolean isDelete;
    private String deleteBy;
    private OffsetDateTime deleteDate;
}