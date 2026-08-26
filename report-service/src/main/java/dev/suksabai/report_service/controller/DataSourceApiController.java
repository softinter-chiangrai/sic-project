package dev.suksabai.report_service.controller;

import dev.suksabai.report_service.service.DataSourceConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/data-sources")
@Tag(name = "Admin / Data Sources API", description = "Administrative APIs for managing database connections used by report templates.")
@SecurityRequirement(name = "sessionCookieAuth")
public class DataSourceApiController {

	private final DataSourceConfigService dataSourceConfigService;

	public DataSourceApiController(DataSourceConfigService dataSourceConfigService) {
		this.dataSourceConfigService = dataSourceConfigService;
	}

	@GetMapping
	@Operation(summary = "List data sources", description = "Return all saved data source summaries for administration screens.")
	public List<DataSourceConfigService.DataSourceListItem> list() {
		return dataSourceConfigService.getAllSummaries();
	}

	@PostMapping
	@Operation(summary = "Create data source", description = "Create a new database connection configuration for report execution.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "Data source created successfully"),
		@ApiResponse(responseCode = "400", description = "Invalid data source payload")
	})
	public DataSourceConfigService.DataSourcePayload create(@RequestBody DataSourceConfigService.DataSourceSaveRequest request) {
		return dataSourceConfigService.create(request);
	}

	@GetMapping("/{id}")
	@Operation(summary = "Get data source", description = "Load a saved data source configuration for editing.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "Data source returned successfully"),
		@ApiResponse(responseCode = "404", description = "Data source not found")
	})
	public DataSourceConfigService.DataSourcePayload getOne(@PathVariable long id) {
		return dataSourceConfigService.getConfig(id);
	}

	@PutMapping("/{id}")
	@Operation(summary = "Update data source", description = "Update connection details for an existing data source configuration.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "Data source updated successfully"),
		@ApiResponse(responseCode = "400", description = "Invalid data source payload"),
		@ApiResponse(responseCode = "404", description = "Data source not found")
	})
	public DataSourceConfigService.DataSourcePayload update(@PathVariable long id, @RequestBody DataSourceConfigService.DataSourceSaveRequest request) {
		return dataSourceConfigService.update(id, request);
	}

	@DeleteMapping("/{id}")
	@Operation(summary = "Delete data source", description = "Remove a data source configuration that is no longer needed.")
	@ApiResponses({
		@ApiResponse(responseCode = "204", description = "Data source deleted successfully"),
		@ApiResponse(responseCode = "404", description = "Data source not found")
	})
	public ResponseEntity<Void> delete(@PathVariable long id) {
		dataSourceConfigService.delete(id);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/{id}/test")
	@Operation(summary = "Test data source connection", description = "Attempt to connect to the saved data source and persist the latest connection test result.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "Connection test completed"),
		@ApiResponse(responseCode = "404", description = "Data source not found")
	})
	public DataSourceConfigService.ConnectionTestResponse testSavedConnection(@PathVariable long id) {
		return dataSourceConfigService.testSavedConnection(id);
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException exception) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
			.body(Map.of("message", exception.getMessage()));
	}

	@ExceptionHandler(DataSourceConfigService.DataSourceNotFoundException.class)
	public ResponseEntity<Map<String, String>> handleNotFound(DataSourceConfigService.DataSourceNotFoundException exception) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
			.body(Map.of("message", exception.getMessage()));
	}
}