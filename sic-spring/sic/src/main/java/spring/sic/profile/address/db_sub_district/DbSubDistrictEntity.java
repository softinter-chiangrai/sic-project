package spring.sic.profile.address.db_sub_district;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "db_sub_district")
@Data
public class DbSubDistrictEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "sub_district_id")
    private UUID subDistrictId;

    @Column(name = "sub_district_code", length = 10)
    private String subDistrictCode;

    @Column(name = "sub_district_name_en", length = 255)
    private String subDistrictNameEn;

    @Column(name = "sub_district_name_local", length = 255)
    private String subDistrictNameLocal;

    @Column(name = "zip_code", length = 20)
    private String zipCode;

    private Long latitude;

    private Long longitude;

    @Column(name = "is_active")
    private Boolean isActive;

    // Audit fields
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