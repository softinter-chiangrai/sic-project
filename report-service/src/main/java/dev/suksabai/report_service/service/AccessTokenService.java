package dev.suksabai.report_service.service;

import dev.suksabai.report_service.model.AccessToken;
import dev.suksabai.report_service.repository.AccessTokenRepository;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Base64;
import java.util.List;

@Service
public class AccessTokenService {

	private static final List<String> SUPPORTED_EXPIRY_POLICIES = List.of("30 days", "60 days", "90 days", "Never");
	private static final List<String> SUPPORTED_STATUSES = List.of("Active", "Suspended", "Revoked");
	private static final SecureRandom SECURE_RANDOM = new SecureRandom();

	private final AccessTokenRepository repository;
	private final AuditLogService auditLogService;
	private final ConfiguredTimeDisplayService timeDisplayService;

	public AccessTokenService(AccessTokenRepository repository, AuditLogService auditLogService, ConfiguredTimeDisplayService timeDisplayService) {
		this.repository = repository;
		this.auditLogService = auditLogService;
		this.timeDisplayService = timeDisplayService;
	}

	@Transactional(readOnly = true)
	public AccessTokenPageResult getPage(int page, int size) {
		int safePage = Math.max(page, 0);
		int safeSize = Math.max(1, Math.min(size, 50));
		ZoneId displayZoneId = timeDisplayService.currentDisplayZoneId();

		List<AccessTokenListItem> items = repository.findAllByOrderByUpdatedAtDesc().stream()
			.map(token -> toListItem(token, displayZoneId))
			.toList();

		long totalItems = items.size();
		int totalPages = totalItems == 0 ? 0 : (int) Math.ceil((double) totalItems / safeSize);
		int resolvedPage = totalPages == 0 ? 0 : Math.min(safePage, totalPages - 1);
		int startIndex = Math.min(resolvedPage * safeSize, items.size());
		int endIndex = Math.min(startIndex + safeSize, items.size());

		PageImpl<AccessTokenListItem> itemPage = new PageImpl<>(
			items.subList(startIndex, endIndex),
			PageRequest.of(resolvedPage, safeSize),
			totalItems
		);

		return new AccessTokenPageResult(
			itemPage.getContent(),
			itemPage.getTotalElements(),
			itemPage.getNumber(),
			itemPage.getSize(),
			itemPage.getTotalPages(),
			itemPage.hasPrevious(),
			itemPage.hasNext()
		);
	}

	@Transactional(readOnly = true)
	public List<AccessTokenListItem> getAllSummaries() {
		ZoneId displayZoneId = timeDisplayService.currentDisplayZoneId();
		return repository.findAllByOrderByUpdatedAtDesc().stream()
			.map(token -> toListItem(token, displayZoneId))
			.toList();
	}

	@Transactional(readOnly = true)
	public AccessTokenStats getStats() {
		List<AccessToken> tokens = repository.findAll();
		long activeCount = tokens.stream().filter(token -> "Active".equalsIgnoreCase(token.getStatus())).count();
		long revokedCount = tokens.stream().filter(token -> "Revoked".equalsIgnoreCase(token.getStatus())).count();
		LocalDateTime expiringCutoff = LocalDateTime.now().plusDays(7);
		long expiringSoonCount = tokens.stream()
			.filter(token -> token.getExpiresAt() != null)
			.filter(token -> !"Revoked".equalsIgnoreCase(token.getStatus()))
			.filter(token -> !token.getExpiresAt().isBefore(LocalDateTime.now()))
			.filter(token -> !token.getExpiresAt().isAfter(expiringCutoff))
			.count();

		return new AccessTokenStats(activeCount, expiringSoonCount, revokedCount);
	}

	@Transactional(readOnly = true)
	public AccessTokenPayload getToken(long id) {
		ZoneId displayZoneId = timeDisplayService.currentDisplayZoneId();
		return repository.findById(id)
			.map(token -> toPayload(token, displayZoneId))
			.orElseThrow(() -> new AccessTokenNotFoundException(id));
	}

	@Transactional(readOnly = true)
	public boolean exists(long id) {
		return repository.existsById(id);
	}

	@Transactional
	public AccessTokenPayload create(AccessTokenSaveRequest request) {
		AccessToken token = new AccessToken();
		applyRequest(token, request);
		AccessToken savedToken = repository.save(token);
		auditLogService.logAdminAction(
			"Access Token Created",
			"Created access token " + savedToken.getTokenName(),
			savedToken.getTokenName()
		);
		return toPayload(savedToken, timeDisplayService.currentDisplayZoneId());
	}

	@Transactional
	public AccessTokenPayload update(long id, AccessTokenSaveRequest request) {
		AccessToken token = repository.findById(id)
			.orElseThrow(() -> new AccessTokenNotFoundException(id));
		applyRequest(token, request);
		AccessToken savedToken = repository.save(token);
		auditLogService.logAdminAction(
			"Access Token Updated",
			"Updated access token " + savedToken.getTokenName(),
			savedToken.getTokenName()
		);
		return toPayload(savedToken, timeDisplayService.currentDisplayZoneId());
	}

	@Transactional
	public AccessTokenGenerateResponse generateToken(long id) {
		AccessToken token = repository.findById(id)
			.orElseThrow(() -> new AccessTokenNotFoundException(id));
		String plainToken = buildPlainToken();
		token.setTokenValue(plainToken);
		token.setStatus("Active");
		token.setRevokedAt(null);
		token = repository.save(token);
		auditLogService.logAdminAction(
			"Access Token Updated",
			"Generated token value for " + token.getTokenName(),
			token.getTokenName()
		);
		ZoneId displayZoneId = timeDisplayService.currentDisplayZoneId();
		return new AccessTokenGenerateResponse(toPayload(token, displayZoneId), plainToken, maskToken(plainToken));
	}

	@Transactional
	public AccessTokenPayload registerToken(long id, AccessTokenRegisterRequest request) {
		AccessToken token = repository.findById(id)
			.orElseThrow(() -> new AccessTokenNotFoundException(id));
		String registeredTokenValue = normalizeRegisteredToken(request == null ? null : request.tokenValue());
		validateUniqueTokenValue(token.getId(), registeredTokenValue);
		token.setTokenValue(registeredTokenValue);
		token.setStatus("Active");
		token.setRevokedAt(null);
		AccessToken savedToken = repository.save(token);
		auditLogService.logAdminAction(
			"Access Token Updated",
			"Registered token value for " + savedToken.getTokenName(),
			savedToken.getTokenName()
		);
		return toPayload(savedToken, timeDisplayService.currentDisplayZoneId());
	}

	@Transactional
	public AccessTokenPayload revoke(long id) {
		AccessToken token = repository.findById(id)
			.orElseThrow(() -> new AccessTokenNotFoundException(id));
		token.setStatus("Revoked");
		token.setRevokedAt(LocalDateTime.now());
		AccessToken savedToken = repository.save(token);
		auditLogService.logAdminAction(
			"Access Token Updated",
			"Revoked access token " + savedToken.getTokenName(),
			savedToken.getTokenName()
		);
		return toPayload(savedToken, timeDisplayService.currentDisplayZoneId());
	}

	@Transactional
	public void revokeForList(long id) {
		revoke(id);
	}

	@Transactional
	public void delete(long id) {
		AccessToken token = repository.findById(id)
			.orElseThrow(() -> new AccessTokenNotFoundException(id));
		String tokenName = token.getTokenName();
		repository.delete(token);
		auditLogService.logAdminAction(
			"Access Token Deleted",
			"Deleted access token " + tokenName,
			tokenName
		);
	}

	@Transactional
	public ApiAccessToken authorizeReportApiToken(String rawTokenValue) {
		if (rawTokenValue == null || rawTokenValue.isBlank()) {
			throw new InvalidAccessTokenException("Access token is required.");
		}

		AccessToken token = repository.findByTokenValue(rawTokenValue.trim())
			.orElseThrow(() -> new InvalidAccessTokenException("Access token is invalid."));

		if (!"Active".equalsIgnoreCase(token.getStatus())) {
			throw new InvalidAccessTokenException("Access token is not active.");
		}

		if (token.getRevokedAt() != null || "Revoked".equalsIgnoreCase(token.getStatus())) {
			throw new InvalidAccessTokenException("Access token has been revoked.");
		}

		if (token.getExpiresAt() != null && !token.getExpiresAt().isAfter(LocalDateTime.now())) {
			throw new InvalidAccessTokenException("Access token has expired.");
		}

		token.setLastUsedAt(LocalDateTime.now());
		token.setCallsToday(token.getCallsToday() + 1);
		repository.save(token);
		return new ApiAccessToken(token.getId(), token.getTokenName());
	}

	private void applyRequest(AccessToken token, AccessTokenSaveRequest request) {
		token.setTokenName(requireText(request.tokenName(), "Token Name"));
		token.setDescription(request.description() == null ? "" : request.description().trim());
		token.setExpiryPolicy(requireExpiryPolicy(request.expiryPolicy()));
		token.setExpiresAt(resolveExpiryDate(token.getExpiryPolicy()));
		token.setStatus(requireStatus(request.status()));
		if (!"Revoked".equals(token.getStatus())) {
			token.setRevokedAt(null);
		} else if (token.getRevokedAt() == null) {
			token.setRevokedAt(LocalDateTime.now());
		}
		if (token.getErrorRate() == null || token.getErrorRate().isBlank()) {
			token.setErrorRate("--");
		}
	}

	private AccessTokenListItem toListItem(AccessToken token, ZoneId displayZoneId) {
		return new AccessTokenListItem(
			token.getId(),
			token.getTokenName(),
			maskToken(token.getTokenValue()),
			formatListDateTime(token.getCreatedAt(), displayZoneId),
			formatListDateTime(token.getLastUsedAt(), displayZoneId),
			token.getStatus(),
			statusClassFor(token.getStatus())
		);
	}

	private AccessTokenPayload toPayload(AccessToken token, ZoneId displayZoneId) {
		return new AccessTokenPayload(
			token.getId(),
			token.getTokenName(),
			token.getDescription(),
			token.getExpiryPolicy(),
			token.getStatus(),
			maskToken(token.getTokenValue()),
			token.getTokenValue(),
			formatDateTime(token.getCreatedAt(), displayZoneId),
			formatDateTime(token.getLastUsedAt(), displayZoneId),
			Long.toString(token.getCallsToday()),
			token.getErrorRate(),
			token.getTokenValue() != null && !token.getTokenValue().isBlank()
		);
	}

	private String requireText(String value, String fieldName) {
		if (value == null || value.isBlank()) {
			throw new IllegalArgumentException(fieldName + " is required.");
		}

		return value.trim();
	}

	private String requireExpiryPolicy(String value) {
		if (value == null || value.isBlank()) {
			throw new IllegalArgumentException("Expiry is required.");
		}

		String trimmedValue = value.trim();
		if (!SUPPORTED_EXPIRY_POLICIES.contains(trimmedValue)) {
			throw new IllegalArgumentException("Expiry is invalid.");
		}

		return trimmedValue;
	}

	private String requireStatus(String value) {
		if (value == null || value.isBlank()) {
			throw new IllegalArgumentException("Status is required.");
		}

		String trimmedValue = value.trim();
		if (!SUPPORTED_STATUSES.contains(trimmedValue)) {
			throw new IllegalArgumentException("Status is invalid.");
		}

		return trimmedValue;
	}

	private LocalDateTime resolveExpiryDate(String expiryPolicy) {
		LocalDateTime now = LocalDateTime.now();
		return switch (expiryPolicy) {
			case "30 days" -> now.plusDays(30);
			case "60 days" -> now.plusDays(60);
			case "90 days" -> now.plusDays(90);
			case "Never" -> null;
			default -> throw new IllegalArgumentException("Expiry is invalid.");
		};
	}

	private String maskToken(String tokenValue) {
		if (tokenValue == null || tokenValue.isBlank()) {
			return "Not generated";
		}

		String suffix = tokenValue.length() <= 4 ? tokenValue : tokenValue.substring(tokenValue.length() - 4);
		return "••••••••••••" + suffix;
	}

	private String buildPlainToken() {
		String candidate;
		do {
			byte[] randomBytes = new byte[24];
			SECURE_RANDOM.nextBytes(randomBytes);
			candidate = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
		} while (repository.existsByTokenValue(candidate));

		return candidate;
	}

	private String normalizeRegisteredToken(String tokenValue) {
		if (tokenValue == null || tokenValue.isBlank()) {
			throw new IllegalArgumentException("Token value is required.");
		}

		return tokenValue.trim();
	}

	private void validateUniqueTokenValue(Long tokenId, String tokenValue) {
		boolean duplicate = tokenId == null
			? repository.existsByTokenValue(tokenValue)
			: repository.existsByTokenValueAndIdNot(tokenValue, tokenId);

		if (duplicate) {
			throw new IllegalArgumentException("Token value is already in use.");
		}
	}

	private String formatDateTime(LocalDateTime value, ZoneId displayZoneId) {
		return timeDisplayService.formatStoredDateTime(value, displayZoneId);
	}

	private String formatListDateTime(LocalDateTime value, ZoneId displayZoneId) {
		return timeDisplayService.formatStoredDateTime(value, displayZoneId, "Never");
	}

	private String statusClassFor(String status) {
		if ("Active".equalsIgnoreCase(status)) {
			return "pill pill--success";
		}

		if ("Suspended".equalsIgnoreCase(status)) {
			return "pill pill--warning";
		}

		return "pill pill--danger";
	}

	public record AccessTokenListItem(
		Long id,
		String tokenName,
		String maskedToken,
		String created,
		String lastUsed,
		String status,
		String statusClass
	) {
	}

	public record AccessTokenPayload(
		Long id,
		String tokenName,
		String description,
		String expiryPolicy,
		String status,
		String maskedApiKey,
		String tokenValue,
		String created,
		String lastUsed,
		String callsToday,
		String errorRate,
		boolean tokenGenerated
	) {
	}

	public record AccessTokenSaveRequest(
		String tokenName,
		String description,
		String expiryPolicy,
		String status
	) {
	}

	public record AccessTokenGenerateResponse(
		AccessTokenPayload token,
		String plainToken,
		String maskedApiKey
	) {
	}

	public record AccessTokenRegisterRequest(
		String tokenValue
	) {
	}

	public record AccessTokenStats(
		long activeCount,
		long expiringSoonCount,
		long revokedCount
	) {
	}

	public record AccessTokenPageResult(
		List<AccessTokenListItem> items,
		long totalItems,
		int pageNumber,
		int pageSize,
		int totalPages,
		boolean hasPrevious,
		boolean hasNext
	) {
	}

	public static class AccessTokenNotFoundException extends RuntimeException {
		public AccessTokenNotFoundException(long id) {
			super("Access token " + id + " was not found.");
		}
	}

	public record ApiAccessToken(
		Long id,
		String tokenName
	) {
	}

	public static class InvalidAccessTokenException extends RuntimeException {
		public InvalidAccessTokenException(String message) {
			super(message);
		}
	}
}