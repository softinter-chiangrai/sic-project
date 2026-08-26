package dev.suksabai.report_service.config;

import dev.suksabai.report_service.service.AccessTokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class AccessTokenApiFilter extends OncePerRequestFilter {

	public static final String REQUEST_ATTRIBUTE = "apiAccessToken";
	private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();

	private final AccessTokenService accessTokenService;

	public AccessTokenApiFilter(AccessTokenService accessTokenService) {
		this.accessTokenService = accessTokenService;
	}

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) {
		return !(isGenerateRequest(request) || isDownloadRequest(request)
			|| isQueueGenerateRequest(request) || isQueueStatusRequest(request)
			|| isBulkGenerateRequest(request) || isBulkDownloadRequest(request));
	}

	private boolean isGenerateRequest(HttpServletRequest request) {
		return "POST".equalsIgnoreCase(request.getMethod()) && "/api/reports/generate".equals(requestPath(request));
	}

	private boolean isDownloadRequest(HttpServletRequest request) {
		return "GET".equalsIgnoreCase(request.getMethod()) && PATH_MATCHER.match("/api/reports/files/*/download", requestPath(request));
	}

	private boolean isQueueGenerateRequest(HttpServletRequest request) {
		return "POST".equalsIgnoreCase(request.getMethod()) && "/api/reports/generate/queue".equals(requestPath(request));
	}

	private boolean isQueueStatusRequest(HttpServletRequest request) {
		return "GET".equalsIgnoreCase(request.getMethod()) && PATH_MATCHER.match("/api/reports/generate/queue/*", requestPath(request));
	}

	private boolean isBulkGenerateRequest(HttpServletRequest request) {
		return "POST".equalsIgnoreCase(request.getMethod()) && "/api/reports/generate/bulk".equals(requestPath(request));
	}

	private boolean isBulkDownloadRequest(HttpServletRequest request) {
		return "GET".equalsIgnoreCase(request.getMethod()) && PATH_MATCHER.match("/api/reports/generate/bulk/*/download", requestPath(request));
	}

	private String requestPath(HttpServletRequest request) {
		String requestUri = request.getRequestURI();
		String contextPath = request.getContextPath();
		if (contextPath == null || contextPath.isEmpty()) {
			return requestUri;
		}

		return requestUri.startsWith(contextPath) ? requestUri.substring(contextPath.length()) : requestUri;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
		try {
			String rawToken = resolveAccessToken(request);
			AccessTokenService.ApiAccessToken apiAccessToken = accessTokenService.authorizeReportApiToken(rawToken);
			request.setAttribute(REQUEST_ATTRIBUTE, apiAccessToken);
			filterChain.doFilter(request, response);
		} catch (AccessTokenService.InvalidAccessTokenException exception) {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			response.setContentType(MediaType.APPLICATION_JSON_VALUE);
			response.getWriter().write("{\"message\":\"" + exception.getMessage().replace("\"", "'") + "\"}");
		}
	}

	private String resolveAccessToken(HttpServletRequest request) {
		return request.getHeader("X-Access-Token");
	}
}