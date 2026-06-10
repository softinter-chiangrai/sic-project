package com.softinter.sicapi.entity.su;

import com.softinter.sicapi.entity.base.BaseEntity;
import com.softinter.sicapi.entity.enums.FileCategory;
import com.softinter.sicapi.entity.enums.FileVisibility;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "su_upload",
       indexes = {
           @Index(name = "idx_bucket_name", columnList = "bucket_name"),
           @Index(name = "idx_object_key", columnList = "object_key")
       })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class SuUpload extends BaseEntity {

    @Column(name = "bussiness_id") // สะกดตาม C# (bussiness_id)
    private UUID businessId;

    @Column(name = "bucket_name", nullable = false, length = 100)
    private String bucketName;

    @Column(name = "object_key", nullable = false, length = 1000)
    private String objectKey;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "content_type", nullable = false, length = 255)
    private String contentType;

    @Column(name = "file_size", nullable = false)
    private Long fileSize = 0L;

    @Column(name = "category", nullable = false, length = 50)
    private String category;

    @Enumerated(EnumType.ORDINAL)
    @Column(name = "visibility", nullable = false)
    private FileVisibility visibility;

    @Column(name = "storage_url", nullable = false, length = 2000)
    private String storageUrl;

    @Column(name = "access_url", nullable = false, length = 2000)
    private String accessUrl;

    @Column(name = "is_streaming", nullable = false)
    private Boolean isStreaming = false;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = false;

    @Column(name = "upload_group_id")
    private UUID uploadGroupId;

    @Column(name = "temp_expires_at")
    private Instant tempExpiresAt;

    @Column(name = "mime_type", nullable = false)
    private String mimeType;

    @Enumerated(EnumType.STRING)
    @Column(name = "file_category", nullable = false)
    private FileCategory fileCategory;

    @Enumerated(EnumType.STRING)
    @Column(name = "file_visibility", nullable = false)
    private FileVisibility fileVisibility;

  
}
