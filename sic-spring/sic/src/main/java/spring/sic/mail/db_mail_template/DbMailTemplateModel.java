package spring.sic.mail.db_mail_template;

import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class DbMailTemplateModel {
    private UUID id;
    private String templateCode;
    private String templateName;
    private String subjectEn;
    private String subjectLocal;
    private String contentEn;
    private String contentLocal;
    private Boolean status;
    private Boolean isActive;
    private String variables;
    private String createdBy;
    private OffsetDateTime createdDate;
    private String updatedBy;
    private OffsetDateTime updatedDate;
    private Boolean isDelete;
    private String deleteBy;
    private OffsetDateTime deleteDate;
}