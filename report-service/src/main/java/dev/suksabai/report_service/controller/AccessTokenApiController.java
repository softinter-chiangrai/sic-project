package dev.suksabai.report_service.controller;

import dev.suksabai.report_service.service.AccessTokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/access-tokens")
@Tag(name = "Admin / Access Tokens API", description = "Administrative APIs for creating, reviewing, rotating, and revoking report access tokens.")
@SecurityRequirement(name = "sessionCookieAuth")
public class AccessTokenApiController {

	private final AccessTokenService accessTokenService;

	public AccessTokenApiController(AccessTokenService accessTokenService) {
		this.accessTokenService = accessTokenService;
	}

	@GetMapping
	@Operation(summary = "List access tokens", description = "Return all configured access token summaries for administrative review.")
	public List<AccessTokenService.AccessTokenListItem> list() {
		return accessTokenService.getAllSummaries();
	}

	@PostMapping
	@Operation(summary = "Create access token", description = "Create a new access token configuration before generating the token value.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "Access token created successfully"),
		@ApiResponse(responseCode = "400", description = "Invalid access token payload")
	})
	public AccessTokenService.AccessTokenPayload create(@RequestBody AccessTokenService.AccessTokenSaveRequest request) {
		return accessTokenService.create(request);
	}

	@GetMapping("/{id}")
	@Operation(summary = "Get access token", description = "Load a single access token configuration for editing.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "Access token returned successfully"),
		@ApiResponse(responseCode = "404", description = "Access token not found")
	})
	public AccessTokenService.AccessTokenPayload getOne(@PathVariable long id) {
		return accessTokenService.getToken(id);
	}

	@PutMapping("/{id}")
	@Operation(summary = "Update access token", description = "Update access token metadata, expiry policy, and status.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "Access token updated successfully"),
		@ApiResponse(responseCode = "400", description = "Invalid access token payload"),
		@ApiResponse(responseCode = "404", description = "Access token not found")
	})
	public AccessTokenService.AccessTokenPayload update(@PathVariable long id, @RequestBody AccessTokenService.AccessTokenSaveRequest request) {
		return accessTokenService.update(id, request);
	}

	@PostMapping("/{id}/generate")
	@Operation(summary = "Generate access token value", description = "Generate or rotate the stored token value for an existing access token record.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "Access token value generated successfully"),
		@ApiResponse(responseCode = "404", description = "Access token not found")
	})
	public AccessTokenService.AccessTokenGenerateResponse generate(@PathVariable long id) {
		return accessTokenService.generateToken(id);
	}

	@PostMapping("/{id}/register")
	@Operation(summary = "Register access token value", description = "Store an access token value that was generated outside the system for an existing access token record.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "Access token value registered successfully"),
		@ApiResponse(responseCode = "400", description = "Invalid access token value"),
		@ApiResponse(responseCode = "404", description = "Access token not found")
	})
	public AccessTokenService.AccessTokenPayload register(@PathVariable long id, @RequestBody AccessTokenService.AccessTokenRegisterRequest request) {
		return accessTokenService.registerToken(id, request);
	}

	@PostMapping("/{id}/revoke")
	@Operation(summary = "Revoke access token", description = "Revoke an access token so it can no longer be used to generate reports.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "Access token revoked successfully"),
		@ApiResponse(responseCode = "404", description = "Access token not found")
	})
	public AccessTokenService.AccessTokenPayload revoke(@PathVariable long id) {
		return accessTokenService.revoke(id);
	}

	@DeleteMapping("/{id}")
	@Operation(summary = "Delete access token", description = "Permanently remove an access token record from the system.")
	@ApiResponses({
		@ApiResponse(responseCode = "204", description = "Access token deleted successfully"),
		@ApiResponse(responseCode = "404", description = "Access token not found")
	})
	public ResponseEntity<Void> delete(@PathVariable long id) {
		accessTokenService.delete(id);
		return ResponseEntity.noContent().build();
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException exception) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
			.body(Map.of("message", exception.getMessage()));
	}

	@ExceptionHandler(AccessTokenService.AccessTokenNotFoundException.class)
	public ResponseEntity<Map<String, String>> handleNotFound(AccessTokenService.AccessTokenNotFoundException exception) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
			.body(Map.of("message", exception.getMessage()));
	}
}