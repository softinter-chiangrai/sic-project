package dev.suksabai.report_service.service;

import dev.suksabai.report_service.model.DataSourceConfig;

public final class JdbcUrlFactory {

	private JdbcUrlFactory() {
	}

	public static String build(DataSourceConfig config) {
		String host = config.getHostAddress().trim();
		int port = config.getPort();
		String databaseName = config.getDatabaseName().trim();
		int connectTimeoutSeconds = resolveConnectTimeoutSeconds(config);
		int socketTimeoutSeconds = resolveSocketTimeoutSeconds(config);

		return switch (config.getDatabaseType()) {
			case POSTGRESQL -> "jdbc:postgresql://" + host + ":" + port + "/" + databaseName
				+ "?connectTimeout=" + connectTimeoutSeconds
				+ "&socketTimeout=" + socketTimeoutSeconds;
			case MYSQL -> "jdbc:mysql://" + host + ":" + port + "/" + databaseName
				+ "?connectTimeout=" + toMillis(connectTimeoutSeconds)
				+ "&socketTimeout=" + toMillis(socketTimeoutSeconds);
			case MARIADB -> "jdbc:mariadb://" + host + ":" + port + "/" + databaseName
				+ "?connectTimeout=" + toMillis(connectTimeoutSeconds)
				+ "&socketTimeout=" + toMillis(socketTimeoutSeconds);
			case ORACLE -> "jdbc:oracle:thin:@//" + host + ":" + port + "/" + databaseName
				+ "?oracle.net.CONNECT_TIMEOUT=" + toMillis(connectTimeoutSeconds)
				+ "&oracle.jdbc.ReadTimeout=" + toMillis(socketTimeoutSeconds);
		};
	}

	public static int resolveConnectTimeoutSeconds(DataSourceConfig config) {
		return normalizeTimeoutSeconds(config.getConnectTimeoutSeconds(), DataSourceConfig.DEFAULT_CONNECT_TIMEOUT_SECONDS);
	}

	public static int resolveSocketTimeoutSeconds(DataSourceConfig config) {
		return normalizeTimeoutSeconds(config.getSocketTimeoutSeconds(), DataSourceConfig.DEFAULT_SOCKET_TIMEOUT_SECONDS);
	}

	private static int normalizeTimeoutSeconds(Integer timeoutSeconds, int defaultValue) {
		if (timeoutSeconds == null || timeoutSeconds <= 0) {
			return defaultValue;
		}

		return timeoutSeconds;
	}

	private static long toMillis(int timeoutSeconds) {
		return timeoutSeconds * 1000L;
	}
}