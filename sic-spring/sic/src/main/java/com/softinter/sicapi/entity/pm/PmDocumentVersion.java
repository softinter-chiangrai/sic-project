package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

@Entity
@Table(name = "pm_document_version")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmDocumentVersion extends BaseBusinessEntity {

    @Column(name = "document_type", nullable = false, length = 50)
    private String documentType;

    @Column(name = "document_id", nullable = false)
    private UUID documentId;

    @Column(name = "version_no", nullable = false, length = 20)
    private String versionNo;

    @Column(name = "change_summary", columnDefinition = "TEXT")
    private String changeSummary;

    @Column(name = "file_path", length = 500)
    private String filePath;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}