package dev.suksabai.report_service.repository;

import dev.suksabai.report_service.model.AuditLogEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface AuditLogEventRepository extends JpaRepository<AuditLogEvent, Long> {
	List<AuditLogEvent> findAllByOrderByOccurredAtDesc();

	Optional<AuditLogEvent> findFirstByEventNameOrderByOccurredAtDesc(String eventName);

	long deleteByEventNameNotIn(List<String> eventNames);
}