package spring.sic.profile.su.su_profile;

import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class SuProfileModel {
    private UUID id;
    private String keycloakUserId;
    private String taxId;
    private UUID titleId;
    private String firstNameEn;
    private String middleNameEn;
    private String lastNameEn;
    private String firstNameLocal;
    private String middleNameLocal;
    private String lastNameLocal;
    private UUID countryId;
    private Boolean supportLocalAddress;
    private String addressEn;
    private String addressLocal;
    private UUID provinceId;
    private UUID districtId;
    private UUID subDistrictId;
    private String zipCode;
    private String email;
    private String phoneNumber;
    private UUID uploadGroupId;
    private Boolean isActive;
    private String createdBy;
    private OffsetDateTime createdDate;
    private String updatedBy;
    private OffsetDateTime updatedDate;
    private Boolean isDelete;
    private String deleteBy;
    private OffsetDateTime deleteDate;
}