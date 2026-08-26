package dev.suksabai.report_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "generated_report_files")
public class GeneratedReportFile {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private Long reportTemplateId;

	@Column(nullable = false)
	private String reportTemplateName;

	@Column(nullable = false)
	private String outputFormat;

	@Column(nullable = false)
	private String downloadFileName;

	@Column(nullable = false)
	private String storagePath;

	@Lob
	@Column(nullable = false)
	private String parametersJson = "{}";

	@Column(nullable = false)
	private long fileSizeBytes;

	@Column(nullable = false)
	private LocalDateTime generatedAt;

	@Column
	private Long generatedByTokenId;

	@Column(nullable = false)
	private String generatedByTokenName;

	@Column(nullable = false)
	private long downloadCount = 0;

	private LocalDateTime lastDownloadedAt;

	@Column(nullable = false)
	private boolean fileDeleted = false;

	private LocalDateTime fileDeletedAt;

	@Column
	private String fileDeletionReason;

	@Column(nullable = false)
	private LocalDateTime updatedAt;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getReportTemplateId() {
		return reportTemplateId;
	}

	public void setReportTemplateId(Long reportTemplateId) {
		this.reportTemplateId = reportTemplateId;
	}

	public String getReportTemplateName() {
		return reportTemplateName;
	}

	public void setReportTemplateName(String reportTemplateName) {
		this.reportTemplateName = reportTemplateName;
	}

	public String getOutputFormat() {
		return outputFormat;
	}

	public void setOutputFormat(String outputFormat) {
		this.outputFormat = outputFormat;
	}

	public String getDownloadFileName() {
		return downloadFileName;
	}

	public void setDownloadFileName(String downloadFileName) {
		this.downloadFileName = downloadFileName;
	}

	public String getStoragePath() {
		return storagePath;
	}

	public void setStoragePath(String storagePath) {
		this.storagePath = storagePath;
	}

	public String getParametersJson() {
		return parametersJson;
	}

	public void setParametersJson(String parametersJson) {
		this.parametersJson = parametersJson;
	}

	public long getFileSizeBytes() {
		return fileSizeBytes;
	}

	public void setFileSizeBytes(long fileSizeBytes) {
		this.fileSizeBytes = fileSizeBytes;
	}

	public LocalDateTime getGeneratedAt() {
		return generatedAt;
	}

	public void setGeneratedAt(LocalDateTime generatedAt) {
		this.generatedAt = generatedAt;
	}

	public Long getGeneratedByTokenId() {
		return generatedByTokenId;
	}

	public void setGeneratedByTokenId(Long generatedByTokenId) {
		this.generatedByTokenId = generatedByTokenId;
	}

	public String getGeneratedByTokenName() {
		return generatedByTokenName;
	}

	public void setGeneratedByTokenName(String generatedByTokenName) {
		this.generatedByTokenName = generatedByTokenName;
	}

	public long getDownloadCount() {
		return downloadCount;
	}

	public void setDownloadCount(long downloadCount) {
		this.downloadCount = downloadCount;
	}

	public LocalDateTime getLastDownloadedAt() {
		return lastDownloadedAt;
	}

	public void setLastDownloadedAt(LocalDateTime lastDownloadedAt) {
		this.lastDownloadedAt = lastDownloadedAt;
	}

	public boolean isFileDeleted() {
		return fileDeleted;
	}

	public void setFileDeleted(boolean fileDeleted) {
		this.fileDeleted = fileDeleted;
	}

	public LocalDateTime getFileDeletedAt() {
		return fileDeletedAt;
	}

	public void setFileDeletedAt(LocalDateTime fileDeletedAt) {
		this.fileDeletedAt = fileDeletedAt;
	}

	public String getFileDeletionReason() {
		return fileDeletionReason;
	}

	public void setFileDeletionReason(String fileDeletionReason) {
		this.fileDeletionReason = fileDeletionReason;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}

	@PrePersist
	void prePersist() {
		LocalDateTime now = LocalDateTime.now();
		updatedAt = now;
		if (generatedAt == null) {
			generatedAt = now;
		}
	}

	@PreUpdate
	void preUpdate() {
		updatedAt = LocalDateTime.now();
	}
}