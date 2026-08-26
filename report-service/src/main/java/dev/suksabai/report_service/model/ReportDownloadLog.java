package dev.suksabai.report_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "report_download_logs")
public class ReportDownloadLog {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private Long generatedReportFileId;

	@Column(nullable = false)
	private String downloadFileName;

	@Column(nullable = false)
	private String reportTemplateName;

	@Column
	private Long downloadedByAccessTokenId;

	@Column(nullable = false)
	private String downloadedBy;

	@Column(nullable = false)
	private LocalDateTime downloadedAt;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getGeneratedReportFileId() {
		return generatedReportFileId;
	}

	public void setGeneratedReportFileId(Long generatedReportFileId) {
		this.generatedReportFileId = generatedReportFileId;
	}

	public String getDownloadFileName() {
		return downloadFileName;
	}

	public void setDownloadFileName(String downloadFileName) {
		this.downloadFileName = downloadFileName;
	}

	public String getReportTemplateName() {
		return reportTemplateName;
	}

	public void setReportTemplateName(String reportTemplateName) {
		this.reportTemplateName = reportTemplateName;
	}

	public Long getDownloadedByAccessTokenId() {
		return downloadedByAccessTokenId;
	}

	public void setDownloadedByAccessTokenId(Long downloadedByAccessTokenId) {
		this.downloadedByAccessTokenId = downloadedByAccessTokenId;
	}

	public String getDownloadedBy() {
		return downloadedBy;
	}

	public void setDownloadedBy(String downloadedBy) {
		this.downloadedBy = downloadedBy;
	}

	public LocalDateTime getDownloadedAt() {
		return downloadedAt;
	}

	public void setDownloadedAt(LocalDateTime downloadedAt) {
		this.downloadedAt = downloadedAt;
	}

	@PrePersist
	void prePersist() {
		if (downloadedAt == null) {
			downloadedAt = LocalDateTime.now();
		}
	}
}