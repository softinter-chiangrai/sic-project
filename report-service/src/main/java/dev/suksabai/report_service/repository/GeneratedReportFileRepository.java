package dev.suksabai.report_service.repository;

import dev.suksabai.report_service.model.GeneratedReportFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GeneratedReportFileRepository extends JpaRepository<GeneratedReportFile, Long> {
	List<GeneratedReportFile> findAllByOrderByGeneratedAtDesc();
}