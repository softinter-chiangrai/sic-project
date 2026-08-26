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
@Table(name = "access_tokens")
public class AccessToken {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String tokenName;

	@Lob
	@Column(nullable = false)
	private String description = "";

	@Column(nullable = false)
	private String expiryPolicy;

	private LocalDateTime expiresAt;

	@Column(nullable = false)
	private String status = "Active";

	@Column(length = 160)
	private String tokenValue;

	private LocalDateTime createdAt;

	private LocalDateTime lastUsedAt;

	private LocalDateTime revokedAt;

	@Column(nullable = false)
	private long callsToday = 0;

	@Column(nullable = false)
	private String errorRate = "--";

	@Column(nullable = false)
	private LocalDateTime updatedAt;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getTokenName() {
		return tokenName;
	}

	public void setTokenName(String tokenName) {
		this.tokenName = tokenName;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getExpiryPolicy() {
		return expiryPolicy;
	}

	public void setExpiryPolicy(String expiryPolicy) {
		this.expiryPolicy = expiryPolicy;
	}

	public LocalDateTime getExpiresAt() {
		return expiresAt;
	}

	public void setExpiresAt(LocalDateTime expiresAt) {
		this.expiresAt = expiresAt;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getTokenValue() {
		return tokenValue;
	}

	public void setTokenValue(String tokenValue) {
		this.tokenValue = tokenValue;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getLastUsedAt() {
		return lastUsedAt;
	}

	public void setLastUsedAt(LocalDateTime lastUsedAt) {
		this.lastUsedAt = lastUsedAt;
	}

	public LocalDateTime getRevokedAt() {
		return revokedAt;
	}

	public void setRevokedAt(LocalDateTime revokedAt) {
		this.revokedAt = revokedAt;
	}

	public long getCallsToday() {
		return callsToday;
	}

	public void setCallsToday(long callsToday) {
		this.callsToday = callsToday;
	}

	public String getErrorRate() {
		return errorRate;
	}

	public void setErrorRate(String errorRate) {
		this.errorRate = errorRate;
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
		if (createdAt == null) {
			createdAt = now;
		}
	}

	@PreUpdate
	void preUpdate() {
		updatedAt = LocalDateTime.now();
	}
}