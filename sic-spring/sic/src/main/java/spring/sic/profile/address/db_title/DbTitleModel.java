package spring.sic.profile.address.db_title;

import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class DbTitleModel {
    private UUID id;
    private String personType;
    private String prefixShortNameTh;
    private String prefixShortNameLocal;
    private String prefixShortNameEn;
    private String prefixNameTh;
    private String prefixNameLocal;
    private String prefixNameEn;
    private String suffixNameEn;
    private String suffixNameLocal;
    private Integer sortOrder;
    private String createdBy;
    private OffsetDateTime createdDate;
    private String updatedBy;
    private OffsetDateTime updatedDate;
    private Boolean isDelete;
    private String deleteBy;
    private OffsetDateTime deleteDate;
}