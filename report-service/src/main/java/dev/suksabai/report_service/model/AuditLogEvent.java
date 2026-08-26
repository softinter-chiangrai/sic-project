package dev.suksabai.report_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_log_events")
public class AuditLogEvent {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String eventName;

	@Lob
	@Column(nullable = false)
	private String eventDetail;

	@Column(nullable = false)
	private String actor;

	@Column(nullable = false)
	private String target;

	@Column(nullable = false)
	private String status;

	@Column(nullable = false)
	private LocalDateTime occurredAt;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getEventName() {
		return eventName;
	}

	public void setEventName(String eventName) {
		this.eventName = eventName;
	}

	public String getEventDetail() {
		return eventDetail;
	}

	public void setEventDetail(String eventDetail) {
		this.eventDetail = eventDetail;
	}

	public String getActor() {
		return actor;
	}

	public void setActor(String actor) {
		this.actor = actor;
	}

	public String getTarget() {
		return target;
	}

	public void setTarget(String target) {
		this.target = target;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public LocalDateTime getOccurredAt() {
		return occurredAt;
	}

	public void setOccurredAt(LocalDateTime occurredAt) {
		this.occurredAt = occurredAt;
	}

	@PrePersist
	void prePersist() {
		if (occurredAt == null) {
			occurredAt = LocalDateTime.now();
		}
	}
}