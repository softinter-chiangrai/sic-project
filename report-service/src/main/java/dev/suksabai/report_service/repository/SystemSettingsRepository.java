package dev.suksabai.report_service.repository;

import dev.suksabai.report_service.model.SystemSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SystemSettingsRepository extends JpaRepository<SystemSettings, Long> {
}