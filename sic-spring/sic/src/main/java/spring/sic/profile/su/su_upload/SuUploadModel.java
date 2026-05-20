package spring.sic.profile.su.su_upload;

import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class SuUploadModel {
    private UUID id;
    private UUID businessId;
    private String bucketName;
    private String objectKey;
    private String fileName;
    private String contentType;
    private Long fileSize;
    private String category;
    private Integer visibility;
    private String storageUrl;
    private Boolean isStreaming;
    private Boolean isActive;
    private UUID uploadGroupId;
    private OffsetDateTime tempExpiresAt;
    private String createdBy;
    private OffsetDateTime createdDate;
    private String updatedBy;
    private OffsetDateTime updatedDate;
    private Boolean isDelete;
    private String deleteBy;
    private OffsetDateTime deleteDate;
}