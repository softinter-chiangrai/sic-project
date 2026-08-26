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
@Table(name = "report_generation_queue_items")
public class ReportGenerationQueueItem {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private Long reportTemplateId;

	@Column(nullable = false)
	private String reportTemplateName;

	@Lob
	@Column(nullable = false)
	private String parametersJson = "{}";

	@Column(nullable = false)
	private String outputFormat;

	@Column(nullable = false)
	private String status = "Queued";

	@Column
	private Long requestedByTokenId;

	@Column(nullable = false)
	private String requestedByTokenName;

	@Column
	private String callbackUrl;

	@Column
	private Long generatedReportFileId;

	@Lob
	private String errorMessage;

	@Column(nullable = false)
	private LocalDateTime submittedAt;

	private LocalDateTime startedAt;

	private LocalDateTime completedAt;

	@Column(nullable = false)
	private String webhookStatus = "NotRequested";

	@Column(nullable = false)
	private int webhookAttempts = 0;

	private LocalDateTime lastWebhookAttemptAt;

	private LocalDateTime nextWebhookAttemptAt;

	@Column
	private String lastWebhookResponseSummary;

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

	public String getParametersJson() {
		return parametersJson;
	}

	public void setParametersJson(String parametersJson) {
		this.parametersJson = parametersJson;
	}

	public String getOutputFormat() {
		return outputFormat;
	}

	public void setOutputFormat(String outputFormat) {
		this.outputFormat = outputFormat;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
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

	public String getCallbackUrl() {
		return callbackUrl;
	}

	public void setCallbackUrl(String callbackUrl) {
		this.callbackUrl = callbackUrl;
	}

	public Long getGeneratedReportFileId() {
		return generatedReportFileId;
	}

	public void setGeneratedReportFileId(Long generatedReportFileId) {
		this.generatedReportFileId = generatedReportFileId;
	}

	public String getErrorMessage() {
		return errorMessage;
	}

	public void setErrorMessage(String errorMessage) {
		this.errorMessage = errorMessage;
	}

	public LocalDateTime getSubmittedAt() {
		return submittedAt;
	}

	public void setSubmittedAt(LocalDateTime submittedAt) {
		this.submittedAt = submittedAt;
	}

	public LocalDateTime getStartedAt() {
		return startedAt;
	}

	public void setStartedAt(LocalDateTime startedAt) {
		this.startedAt = startedAt;
	}

	public LocalDateTime getCompletedAt() {
		return completedAt;
	}

	public void setCompletedAt(LocalDateTime completedAt) {
		this.completedAt = completedAt;
	}

	public String getWebhookStatus() {
		return webhookStatus;
	}

	public void setWebhookStatus(String webhookStatus) {
		this.webhookStatus = webhookStatus;
	}

	public int getWebhookAttempts() {
		return webhookAttempts;
	}

	public void setWebhookAttempts(int webhookAttempts) {
		this.webhookAttempts = webhookAttempts;
	}

	public LocalDateTime getLastWebhookAttemptAt() {
		return lastWebhookAttemptAt;
	}

	public void setLastWebhookAttemptAt(LocalDateTime lastWebhookAttemptAt) {
		this.lastWebhookAttemptAt = lastWebhookAttemptAt;
	}

	public LocalDateTime getNextWebhookAttemptAt() {
		return nextWebhookAttemptAt;
	}

	public void setNextWebhookAttemptAt(LocalDateTime nextWebhookAttemptAt) {
		this.nextWebhookAttemptAt = nextWebhookAttemptAt;
	}

	public String getLastWebhookResponseSummary() {
		return lastWebhookResponseSummary;
	}

	public void setLastWebhookResponseSummary(String lastWebhookResponseSummary) {
		this.lastWebhookResponseSummary = lastWebhookResponseSummary;
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
		if (submittedAt == null) {
			submittedAt = now;
		}
	}

	@PreUpdate
	void preUpdate() {
		updatedAt = LocalDateTime.now();
	}
}
