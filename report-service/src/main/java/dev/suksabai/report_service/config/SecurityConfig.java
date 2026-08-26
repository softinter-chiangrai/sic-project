package dev.suksabai.report_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableConfigurationProperties(SecurityProperties.class)
public class SecurityConfig {
	private final AccessTokenApiFilter accessTokenApiFilter;
	private final String allowedOrigins;
	private final int rememberMeValiditySeconds;
	private final String rememberMeKey;

	public SecurityConfig(
		AccessTokenApiFilter accessTokenApiFilter,
		@Value("${app.cors.allowed-origins:*}") String allowedOrigins,
		SecurityProperties securityProperties
	) {
		this.accessTokenApiFilter = accessTokenApiFilter;
		this.allowedOrigins = allowedOrigins;
		this.rememberMeValiditySeconds = securityProperties.getRememberMe().getDays() * 24 * 60 * 60;
		this.rememberMeKey = securityProperties.getRememberMe().getKey();
	}

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
			.cors(Customizer.withDefaults())
			.authorizeHttpRequests(authorize -> authorize
				.requestMatchers(
					"/login",
					"/error",
					"/favicon.ico",
					"/css/**",
					"/js/**",
					"/images/**",
					"/fonts/**",
					"/webjars/**"
				).permitAll()
				.requestMatchers(HttpMethod.OPTIONS, "/api/reports/generate").permitAll()
				.requestMatchers(HttpMethod.OPTIONS, "/api/reports/files/*/download").permitAll()
				.requestMatchers(HttpMethod.OPTIONS, "/api/reports/generate/queue").permitAll()
				.requestMatchers(HttpMethod.OPTIONS, "/api/reports/generate/queue/*").permitAll()
				.requestMatchers(HttpMethod.OPTIONS, "/api/reports/generate/bulk").permitAll()
				.requestMatchers(HttpMethod.OPTIONS, "/api/reports/generate/bulk/*/download").permitAll()
				.requestMatchers(HttpMethod.POST, "/api/reports/generate").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/reports/files/*/download").permitAll()
				.requestMatchers(HttpMethod.POST, "/api/reports/generate/queue").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/reports/generate/queue/*").permitAll()
				.requestMatchers(HttpMethod.POST, "/api/reports/generate/bulk").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/reports/generate/bulk/*/download").permitAll()
				.anyRequest().authenticated()
			)
			.formLogin(form -> form
				.loginPage("/login")
				.defaultSuccessUrl("/", true)
				.permitAll()
			)
			.logout(logout -> logout
				.deleteCookies("remember-me")
				.logoutSuccessUrl("/login?logout")
			)
			.rememberMe(rememberMe -> rememberMe
				.rememberMeParameter("remember-me")
				.tokenValiditySeconds(rememberMeValiditySeconds)
				.key(rememberMeKey)
			)
			.csrf(csrf -> csrf
				.ignoringRequestMatchers("/h2-console/**", "/api/reports/generate", "/api/reports/generate/queue", "/api/reports/generate/bulk")
			)
			.headers(headers -> headers
				.frameOptions(frameOptions -> frameOptions.sameOrigin())
			)
			.addFilterBefore(accessTokenApiFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	@Bean
	CorsConfigurationSource corsConfigurationSource() {
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/api/reports/generate", createPublicReportCorsConfiguration(List.of("POST", "OPTIONS")));
		source.registerCorsConfiguration("/api/reports/files/*/download", createPublicReportCorsConfiguration(List.of("GET", "OPTIONS")));
		source.registerCorsConfiguration("/api/reports/generate/queue", createPublicReportCorsConfiguration(List.of("POST", "OPTIONS")));
		source.registerCorsConfiguration("/api/reports/generate/queue/*", createPublicReportCorsConfiguration(List.of("GET", "OPTIONS")));
		source.registerCorsConfiguration("/api/reports/generate/bulk", createPublicReportCorsConfiguration(List.of("POST", "OPTIONS")));
		source.registerCorsConfiguration("/api/reports/generate/bulk/*/download", createPublicReportCorsConfiguration(List.of("GET", "OPTIONS")));
		return source;
	}

	private CorsConfiguration createPublicReportCorsConfiguration(List<String> allowedMethods) {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOriginPatterns(resolveAllowedOrigins());
		configuration.setAllowedMethods(allowedMethods);
		configuration.setAllowedHeaders(List.of("*"));
		configuration.setExposedHeaders(List.of(HttpHeaders.CONTENT_DISPOSITION, HttpHeaders.CONTENT_TYPE, HttpHeaders.CONTENT_LENGTH));
		configuration.setAllowCredentials(false);
		configuration.setMaxAge(3600L);
		return configuration;
	}

	private List<String> resolveAllowedOrigins() {
		if (allowedOrigins == null || allowedOrigins.isBlank()) {
			return List.of("*");
		}

		return Arrays.stream(allowedOrigins.split(","))
			.map(String::trim)
			.filter(origin -> !origin.isEmpty())
			.toList();
	}
}