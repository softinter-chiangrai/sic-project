package spring.sic.mail.db_mail_queue;

import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class DbMailQueueModel {
    private UUID id;
    private UUID templateId;
    private String recipientEmail;
    private String recipientName;
    private String bodyData;
    private OffsetDateTime sentAt;
    private Integer retryCount;
    private String errorMessage;
    private OffsetDateTime scheduledAt;
    private OffsetDateTime createdDate;
    private OffsetDateTime nextRetryAt;
    private UUID userConfigId;
    private Boolean useEnglish;
    private String createdBy;
    private String updatedBy;
    private OffsetDateTime updatedDate;
    private Boolean isDelete;
    private String deleteBy;
    private OffsetDateTime deleteDate;
}
