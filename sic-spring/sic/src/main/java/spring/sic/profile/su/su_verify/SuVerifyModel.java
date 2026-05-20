package spring.sic.profile.su.su_verify;

import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class SuVerifyModel {
    private UUID id;
    private String verifyType;
    private String referenceNumber;
    private String token;
    private Integer maxRetry;
    private Integer retryCount;
    private OffsetDateTime expireAt;
    private String recipient;
    private String createdBy;
    private OffsetDateTime createdDate;
    private String updatedBy;
    private OffsetDateTime updatedDate;
    private Boolean isDelete;
    private String deleteBy;
    private OffsetDateTime deleteDate;
}