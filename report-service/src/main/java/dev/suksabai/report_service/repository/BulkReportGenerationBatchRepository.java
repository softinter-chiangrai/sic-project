package dev.suksabai.report_service.repository;

import dev.suksabai.report_service.model.BulkReportGenerationBatch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BulkReportGenerationBatchRepository extends JpaRepository<BulkReportGenerationBatch, Long> {
	List<BulkReportGenerationBatch> findAllByOrderByGeneratedAtDesc();
}
