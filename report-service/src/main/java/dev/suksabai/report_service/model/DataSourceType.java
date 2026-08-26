package dev.suksabai.report_service.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum DataSourceType {
	POSTGRESQL("postgresql", 5432),
	MYSQL("mysql", 3306),
	MARIADB("mariadb", 3306),
	ORACLE("oracle", 1521);

	private final String value;
	private final int defaultPort;

	DataSourceType(String value, int defaultPort) {
		this.value = value;
		this.defaultPort = defaultPort;
	}

	@JsonValue
	public String getValue() {
		return value;
	}

	public int getDefaultPort() {
		return defaultPort;
	}

	@JsonCreator
	public static DataSourceType fromValue(String value) {
		for (DataSourceType type : values()) {
			if (type.value.equalsIgnoreCase(value)) {
				return type;
			}
		}

		throw new IllegalArgumentException("Unsupported database type: " + value);
	}
}