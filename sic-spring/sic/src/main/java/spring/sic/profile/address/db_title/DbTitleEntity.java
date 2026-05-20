package spring.sic.profile.address.db_title;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "db_title")
@Data
public class DbTitleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "person_type", length = 20)
    private String personType;

    @Column(name = "prefix_short_name_th", length = 100)
    private String prefixShortNameTh;

    @Column(name = "prefix_short_name_local", length = 100)
    private String prefixShortNameLocal;

    @Column(name = "prefix_short_name_en", length = 100)
    private String prefixShortNameEn;

    @Column(name = "prefix_name_th", length = 100)
    private String prefixNameTh;

    @Column(name = "prefix_name_local", length = 100)
    private String prefixNameLocal;

    @Column(name = "prefix_name_en", length = 100)
    private String prefixNameEn;

    @Column(name = "suffix_name_en", length = 100)
    private String suffixNameEn;

    @Column(name = "suffix_name_local", length = 100)
    private String suffixNameLocal;

    @Column(name = "sort_order")
    private Integer sortOrder;

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