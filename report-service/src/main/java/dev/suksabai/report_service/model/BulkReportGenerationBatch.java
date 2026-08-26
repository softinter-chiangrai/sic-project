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
@Table(name = "bulk_report_generation_batches")
public class BulkReportGenerationBatch {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column
	private Long requestedByTokenId;

	@Column(nullable = false)
	private String requestedByTokenName;

	@Column(nullable = false)
	private int itemCount;

	@Column(nullable = false)
	private int successCount;

	@Column(nullable = false)
	private int failureCount;

	@Lob
	@Column(nullable = false)
	private String itemResultsJson = "[]";

	@Column(nullable = false)
	private String zipFileName;

	@Column(nullable = false)
	private String zipStoragePath;

	@Column(nullable = false)
	private long zipFileSizeBytes;

	@Column(nullable = false)
	private LocalDateTime generatedAt;

	@Column(nullable = false)
	private long downloadCount = 0;

	private LocalDateTime lastDownloadedAt;

	@Column(nullable = false)
	private LocalDateTime updatedAt;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getRequestedByTokenId() {
		return requestedByTokenId;
	}

	public void setRequestedByTokenId(Long requestedByTokenId) {
		this.requestedByTokenId = requestedByTokenId;
	}

	public String getRequestedByTokenName() {
		return requestedByTokenName;
	}

	public void setRequestedByTokenName(String requestedByTokenName) {
		this.requestedByTokenName = requestedByTokenName;
	}

	public int getItemCount() {
		return itemCount;
	}

	public void setItemCount(int itemCount) {
		this.itemCount = itemCount;
	}

	public int getSuccessCount() {
		return successCount;
	}

	public void setSuccessCount(int successCount) {
		this.successCount = successCount;
	}

	public int getFailureCount() {
		return failureCount;
	}

	public void setFailureCount(int failureCount) {
		this.failureCount = failureCount;
	}

	public String getItemResultsJson() {
		return itemResultsJson;
	}

	public void setItemResultsJson(String itemResultsJson) {
		this.itemResultsJson = itemResultsJson;
	}

	public String getZipFileName() {
		return zipFileName;
	}

	public void setZipFileName(String zipFileName) {
		this.zipFileName = zipFileName;
	}

	public String getZipStoragePath() {
		return zipStoragePath;
	}

	public void setZipStoragePath(String zipStoragePath) {
		this.zipStoragePath = zipStoragePath;
	}

	public long getZipFileSizeBytes() {
		return zipFileSizeBytes;
	}

	public void setZipFileSizeBytes(long zipFileSizeBytes) {
		this.zipFileSizeBytes = zipFileSizeBytes;
	}

	public LocalDateTime getGeneratedAt() {
		return generatedAt;
	}

	public void setGeneratedAt(LocalDateTime generatedAt) {
		this.generatedAt = generatedAt;
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
