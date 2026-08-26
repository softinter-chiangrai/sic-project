package dev.suksabai.report_service.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.responses.ApiResponses;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.LinkedHashMap;
import java.util.Map;

@Configuration
@OpenAPIDefinition(
	info = @Info(
		title = "Jasper Report Server API",
		version = "v1",
		description = "Interactive API reference for Jasper Report Server. Administrative APIs require a logged-in browser session cookie, while report generation and API report downloads require X-Access-Token."
	),
	security = @SecurityRequirement(name = "sessionCookieAuth")
)
@SecurityScheme(
	name = "sessionCookieAuth",
	type = SecuritySchemeType.APIKEY,
	in = SecuritySchemeIn.COOKIE,
	paramName = "JSESSIONID",
	description = "Administrative APIs, API docs, and Swagger UI require a logged-in browser session cookie."
)
@SecurityScheme(
	name = "reportAccessTokenHeader",
	type = SecuritySchemeType.APIKEY,
	in = SecuritySchemeIn.HEADER,
	paramName = "X-Access-Token",
	description = "Use an active report access token from the Access Tokens menu. The token must not be expired or revoked."
)
public class OpenApiConfig {

	@Bean
	OpenApiCustomizer successResponsesOnlyCustomizer() {
		return openApi -> {
			if (openApi.getPaths() == null) {
				return;
			}

			openApi.getPaths().forEach((path, pathItem) -> {
				if (pathItem == null) {
					return;
				}

				pathItem.readOperations().forEach(this::retainOnlySuccessResponses);
			});
		};
	}

	private void retainOnlySuccessResponses(Operation operation) {
		if (operation == null || operation.getResponses() == null) {
			return;
		}

		Map<String, io.swagger.v3.oas.models.responses.ApiResponse> successResponses = new LinkedHashMap<>();
		operation.getResponses().forEach((statusCode, response) -> {
			if (statusCode != null && statusCode.startsWith("2")) {
				successResponses.put(statusCode, response);
			}
		});

		ApiResponses filteredResponses = new ApiResponses();
		filteredResponses.putAll(successResponses);
		operation.setResponses(filteredResponses);
	}
}