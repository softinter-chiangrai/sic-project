package dev.suksabai.report_service.repository;

import dev.suksabai.report_service.model.DataSourceConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DataSourceConfigRepository extends JpaRepository<DataSourceConfig, Long> {
	List<DataSourceConfig> findAllByOrderByUpdatedAtDesc();
}