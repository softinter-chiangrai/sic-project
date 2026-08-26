package dev.suksabai.report_service.repository;

import dev.suksabai.report_service.model.AccessToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccessTokenRepository extends JpaRepository<AccessToken, Long> {
	List<AccessToken> findAllByOrderByUpdatedAtDesc();

	Optional<AccessToken> findByTokenValue(String tokenValue);

	boolean existsByTokenValue(String tokenValue);

	boolean existsByTokenValueAndIdNot(String tokenValue, Long id);
}