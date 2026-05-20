package spring.sic.profile.su.su_profile;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "su_profile")
@Data
public class SuProfileEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "keycloak_user_id", length = 100)
    private String keycloakUserId;

    @Column(name = "tax_id", length = 30)
    private String taxId;

    @Column(name = "title_id")
    private UUID titleId;

    @Column(name = "first_name_en", length = 100)
    private String firstNameEn;

    @Column(name = "middle_name_en", length = 100)
    private String middleNameEn;

    @Column(name = "last_name_en", length = 100)
    private String lastNameEn;

    @Column(name = "first_name_local", length = 100)
    private String firstNameLocal;

    @Column(name = "middle_name_local", length = 100)
    private String middleNameLocal;

    @Column(name = "last_name_local", length = 100)
    private String lastNameLocal;

    @Column(name = "country_id")
    private UUID countryId;

    @Column(name = "support_local_address")
    private Boolean supportLocalAddress;

    @Column(name = "address_en", length = 255)
    private String addressEn;

    @Column(name = "address_local", length = 255)
    private String addressLocal;

    @Column(name = "province_id")
    private UUID provinceId;

    @Column(name = "district_id")
    private UUID districtId;

    @Column(name = "sub_district_id")
    private UUID subDistrictId;

    @Column(name = "zip_code", length = 20)
    private String zipCode;

    @Column(name = "email", length = 320)
    private String email;

    @Column(name = "phone_number", length = 32)
    private String phoneNumber;

    @Column(name = "upload_group_id")
    private UUID uploadGroupId;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_date", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdDate;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "updated_date", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime updatedDate;

    @Column(name = "is_delete")
    private Boolean isDelete;

    @Column(name = "delete_by", length = 100)
    private String deleteBy;

    @Column(name = "delete_date", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime deleteDate;
}