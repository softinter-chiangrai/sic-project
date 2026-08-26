package dev.suksabai.report_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "data_source_configs")
public class DataSourceConfig {

	public static final int DEFAULT_CONNECT_TIMEOUT_SECONDS = 10;
	public static final int DEFAULT_SOCKET_TIMEOUT_SECONDS = 30;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String databaseName;

	@Column(nullable = false)
	private String connectionLabel;

	@Enumerated(EnumType.STRING)
	@JdbcTypeCode(SqlTypes.VARCHAR)
	@Column(nullable = false, length = 20)
	private DataSourceType databaseType;

	@Column(nullable = false)
	private String hostAddress;

	@Column(nullable = false)
	private Integer port;

	@Column(nullable = false)
	private String username;

	@Column(nullable = false)
	private String password;

	private Integer connectTimeoutSeconds = DEFAULT_CONNECT_TIMEOUT_SECONDS;

	private Integer socketTimeoutSeconds = DEFAULT_SOCKET_TIMEOUT_SECONDS;

	@Column(nullable = false)
	private String lastTestStatus = "Not tested";

	private LocalDateTime lastTestedAt;

	private Long lastResponseTimeMs;

	@Column(nullable = false)
	private LocalDateTime updatedAt;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getDatabaseName() {
		return databaseName;
	}

	public void setDatabaseName(String databaseName) {
		this.databaseName = databaseName;
	}

	public String getConnectionLabel() {
		return connectionLabel;
	}

	public void setConnectionLabel(String connectionLabel) {
		this.connectionLabel = connectionLabel;
	}

	public DataSourceType getDatabaseType() {
		return databaseType;
	}

	public void setDatabaseType(DataSourceType databaseType) {
		this.databaseType = databaseType;
	}

	public String getHostAddress() {
		return hostAddress;
	}

	public void setHostAddress(String hostAddress) {
		this.hostAddress = hostAddress;
	}

	public Integer getPort() {
		return port;
	}

	public void setPort(Integer port) {
		this.port = port;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public Integer getConnectTimeoutSeconds() {
		return connectTimeoutSeconds;
	}

	public void setConnectTimeoutSeconds(Integer connectTimeoutSeconds) {
		this.connectTimeoutSeconds = connectTimeoutSeconds;
	}

	public Integer getSocketTimeoutSeconds() {
		return socketTimeoutSeconds;
	}

	public void setSocketTimeoutSeconds(Integer socketTimeoutSeconds) {
		this.socketTimeoutSeconds = socketTimeoutSeconds;
	}

	public String getLastTestStatus() {
		return lastTestStatus;
	}

	public void setLastTestStatus(String lastTestStatus) {
		this.lastTestStatus = lastTestStatus;
	}

	public LocalDateTime getLastTestedAt() {
		return lastTestedAt;
	}

	public void setLastTestedAt(LocalDateTime lastTestedAt) {
		this.lastTestedAt = lastTestedAt;
	}

	public Long getLastResponseTimeMs() {
		return lastResponseTimeMs;
	}

	public void setLastResponseTimeMs(Long lastResponseTimeMs) {
		this.lastResponseTimeMs = lastResponseTimeMs;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}

	@PrePersist
	@PreUpdate
	void touch() {
		updatedAt = LocalDateTime.now();
	}
}