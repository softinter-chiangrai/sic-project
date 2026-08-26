package dev.suksabai.report_service.repository;

import dev.suksabai.report_service.model.ReportTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReportTemplateRepository extends JpaRepository<ReportTemplate, Long> {
	List<ReportTemplate> findAllByOrderByUpdatedAtDesc();

	Optional<ReportTemplate> findByTemplateCodeIgnoreCase(String templateCode);

	boolean existsByTemplateCodeIgnoreCase(String templateCode);

	boolean existsByTemplateCodeIgnoreCaseAndIdNot(String templateCode, Long id);
}