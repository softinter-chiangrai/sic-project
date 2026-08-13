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

    @Column(name = "document_code", length = 100)
    private String documentCode;

    @Column(name = "project_id")
    private UUID projectId;

    @Column(name = "version_no", nullable = false, length = 20)
    private String versionNo;

    @Column(name = "change_summary", columnDefinition = "TEXT")
    private String changeSummary;

    @Column(name = "previous_version_id")
    private UUID previousVersionId;

    @Column(name = "approval_status", length = 30)
    private String approvalStatus = "DRAFT";

    @Column(name = "approved_by", length = 255)
    private String approvedBy;

    @Column(name = "approved_date")
    private java.time.Instant approvedDate;

    @Column(name = "snapshot_data", columnDefinition = "TEXT")
    private String snapshotData;

    @Column(name = "file_ref_id")
    private UUID fileRefId;

    @Column(name = "file_path", length = 500)
    private String filePath;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}