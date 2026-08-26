package dev.suksabai.report_service.repository;

import dev.suksabai.report_service.model.ReportGenerationQueueItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportGenerationQueueItemRepository extends JpaRepository<ReportGenerationQueueItem, Long> {
	List<ReportGenerationQueueItem> findAllByOrderBySubmittedAtDesc();

	List<ReportGenerationQueueItem> findAllByStatusOrderBySubmittedAtAsc(String status);

	List<ReportGenerationQueueItem> findAllByStatusInOrderBySubmittedAtAsc(List<String> statuses);
}
