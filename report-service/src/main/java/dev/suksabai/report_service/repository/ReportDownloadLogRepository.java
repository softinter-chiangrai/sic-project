package dev.suksabai.report_service.repository;

import dev.suksabai.report_service.model.ReportDownloadLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportDownloadLogRepository extends JpaRepository<ReportDownloadLog, Long> {
	List<ReportDownloadLog> findAllByOrderByDownloadedAtDesc();
	List<ReportDownloadLog> findTop25ByOrderByDownloadedAtDesc();
}