package spring.sic.profile.address.db_country;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "db_country")
@Data
public class DbCountryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "country_code", length = 10)
    private String countryCode;

    @Column(name = "iso_code", length = 10)
    private String isoCode;

    @Column(name = "country_name_en", length = 100)
    private String countryNameEn;

    @Column(name = "country_name_local", length = 100)
    private String countryNameLocal;

    @Column(name = "support_local_address")
    private Boolean supportLocalAddress;

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