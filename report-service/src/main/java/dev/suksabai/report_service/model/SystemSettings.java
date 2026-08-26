package dev.suksabai.report_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "system_settings")
public class SystemSettings {

	@Id
	private Long id;

	@Column(nullable = false)
	private Boolean generatedReportCleanupEnabled = true;

	@Column(nullable = false)
	private String generatedReportCleanupFrequency = "Monthly";

	@Column(nullable = false)
	private LocalTime generatedReportCleanupTime = LocalTime.of(5, 0);

	private String generatedReportCleanupTimezone = "Asia/Bangkok";

	private LocalDateTime lastGeneratedReportCleanupAt;

	@Column(nullable = false)
	private LocalDateTime updatedAt;

	private String downloadBaseUrl;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Boolean getGeneratedReportCleanupEnabled() {
		return generatedReportCleanupEnabled;
	}

	public void setGeneratedReportCleanupEnabled(Boolean generatedReportCleanupEnabled) {
		this.generatedReportCleanupEnabled = generatedReportCleanupEnabled;
	}

	public String getGeneratedReportCleanupFrequency() {
		return generatedReportCleanupFrequency;
	}

	public void setGeneratedReportCleanupFrequency(String generatedReportCleanupFrequency) {
		this.generatedReportCleanupFrequency = generatedReportCleanupFrequency;
	}

	public LocalTime getGeneratedReportCleanupTime() {
		return generatedReportCleanupTime;
	}

	public void setGeneratedReportCleanupTime(LocalTime generatedReportCleanupTime) {
		this.generatedReportCleanupTime = generatedReportCleanupTime;
	}

	public String getGeneratedReportCleanupTimezone() {
		return generatedReportCleanupTimezone;
	}

	public void setGeneratedReportCleanupTimezone(String generatedReportCleanupTimezone) {
		this.generatedReportCleanupTimezone = generatedReportCleanupTimezone;
	}

	public LocalDateTime getLastGeneratedReportCleanupAt() {
		return lastGeneratedReportCleanupAt;
	}

	public void setLastGeneratedReportCleanupAt(LocalDateTime lastGeneratedReportCleanupAt) {
		this.lastGeneratedReportCleanupAt = lastGeneratedReportCleanupAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}

	public String getDownloadBaseUrl() {
		return downloadBaseUrl;
	}

	public void setDownloadBaseUrl(String downloadBaseUrl) {
		this.downloadBaseUrl = downloadBaseUrl;
	}

	@PrePersist
	void prePersist() {
		updatedAt = LocalDateTime.now();
	}

	@PreUpdate
	void preUpdate() {
		updatedAt = LocalDateTime.now();
	}
}