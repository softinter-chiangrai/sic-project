package spring.sic.profile.su.su_upload;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "su_upload")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SuUploadEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "business_id")
    private UUID businessId;

    @Column(name = "bucket_name", length = 1000)
    private String bucketName;

    @Column(name = "object_key", length = 1000)
    private String objectKey;

    @Column(name = "file_name", length = 255)
    private String fileName;

    @Column(name = "content_type", length = 255)
    private String contentType;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "category", length = 50)
    private String category;

    @Column(name = "visibility")
    private Integer visibility;

    @Column(name = "storage_url", length = 2000)
    private String storageUrl;

    @Column(name = "is_streaming")
    private Boolean isStreaming;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "upload_group_id")
    private UUID uploadGroupId;

    @Column(name = "temp_expires_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime tempExpiresAt;

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