package dev.suksabai.report_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "report_templates")
public class ReportTemplate {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column
	private String templateCode;

	@Column(nullable = false)
	private String templateName;

	@Lob
	@Column(nullable = false)
	private String description = "";

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "data_source_id")
	private DataSourceConfig dataSourceConfig;

	@Column(nullable = false)
	private String originalFileName;

	@Column(nullable = false)
	private String jrxmlStoragePath;

	@Column(nullable = false)
	private String jasperStoragePath;

	@Lob
	@Column(nullable = false)
	private String parameterSchemaJson = "[]";

	@Column(nullable = false)
	private LocalDateTime uploadedAt;

	@Column(nullable = false)
	private LocalDateTime updatedAt;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getTemplateCode() {
		return templateCode;
	}

	public void setTemplateCode(String templateCode) {
		this.templateCode = templateCode;
	}

	public String getTemplateName() {
		return templateName;
	}

	public void setTemplateName(String templateName) {
		this.templateName = templateName;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description == null ? "" : description;
	}

	public DataSourceConfig getDataSourceConfig() {
		return dataSourceConfig;
	}

	public void setDataSourceConfig(DataSourceConfig dataSourceConfig) {
		this.dataSourceConfig = dataSourceConfig;
	}

	public String getOriginalFileName() {
		return originalFileName;
	}

	public void setOriginalFileName(String originalFileName) {
		this.originalFileName = originalFileName;
	}

	public String getJrxmlStoragePath() {
		return jrxmlStoragePath;
	}

	public void setJrxmlStoragePath(String jrxmlStoragePath) {
		this.jrxmlStoragePath = jrxmlStoragePath;
	}

	public String getJasperStoragePath() {
		return jasperStoragePath;
	}

	public void setJasperStoragePath(String jasperStoragePath) {
		this.jasperStoragePath = jasperStoragePath;
	}

	public String getParameterSchemaJson() {
		return parameterSchemaJson;
	}

	public void setParameterSchemaJson(String parameterSchemaJson) {
		this.parameterSchemaJson = parameterSchemaJson;
	}

	public LocalDateTime getUploadedAt() {
		return uploadedAt;
	}

	public void setUploadedAt(LocalDateTime uploadedAt) {
		this.uploadedAt = uploadedAt;
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
		if (uploadedAt == null) {
			uploadedAt = now;
		}
	}

	@PreUpdate
	void preUpdate() {
		updatedAt = LocalDateTime.now();
	}
}