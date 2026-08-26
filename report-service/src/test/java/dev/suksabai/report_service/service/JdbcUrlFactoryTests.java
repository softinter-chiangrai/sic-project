package dev.suksabai.report_service.service;

import dev.suksabai.report_service.model.DataSourceConfig;
import dev.suksabai.report_service.model.DataSourceType;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JdbcUrlFactoryTests {

	@Test
	void buildShouldIncludeConnectAndSocketTimeoutForPostgreSql() {
		DataSourceConfig config = createConfig(DataSourceType.POSTGRESQL, "reporting");
		config.setConnectTimeoutSeconds(10);
		config.setSocketTimeoutSeconds(30);

		String jdbcUrl = JdbcUrlFactory.build(config);

		assertThat(jdbcUrl).isEqualTo("jdbc:postgresql://db.internal:5432/reporting?connectTimeout=10&socketTimeout=30");
	}

	@Test
	void buildShouldIncludeMillisecondTimeoutsForMysql() {
		DataSourceConfig config = createConfig(DataSourceType.MYSQL, "analytics");
		config.setConnectTimeoutSeconds(10);
		config.setSocketTimeoutSeconds(30);

		String jdbcUrl = JdbcUrlFactory.build(config);

		assertThat(jdbcUrl).isEqualTo("jdbc:mysql://db.internal:5432/analytics?connectTimeout=10000&socketTimeout=30000");
	}

	@Test
	void buildShouldIncludeMillisecondTimeoutsForMariaDb() {
		DataSourceConfig config = createConfig(DataSourceType.MARIADB, "warehouse");
		config.setConnectTimeoutSeconds(10);
		config.setSocketTimeoutSeconds(30);

		String jdbcUrl = JdbcUrlFactory.build(config);

		assertThat(jdbcUrl).isEqualTo("jdbc:mariadb://db.internal:5432/warehouse?connectTimeout=10000&socketTimeout=30000");
	}

	@Test
	void buildShouldIncludeMillisecondTimeoutsForOracle() {
		DataSourceConfig config = createConfig(DataSourceType.ORACLE, "warehouse");
		config.setConnectTimeoutSeconds(10);
		config.setSocketTimeoutSeconds(30);

		String jdbcUrl = JdbcUrlFactory.build(config);

		assertThat(jdbcUrl).isEqualTo("jdbc:oracle:thin:@//db.internal:5432/warehouse?oracle.net.CONNECT_TIMEOUT=10000&oracle.jdbc.ReadTimeout=30000");
	}

	@Test
	void buildShouldFallBackToDefaultTimeoutsWhenPersistedValuesAreMissing() {
		DataSourceConfig config = createConfig(DataSourceType.POSTGRESQL, "fallback");

		String jdbcUrl = JdbcUrlFactory.build(config);

		assertThat(jdbcUrl).isEqualTo("jdbc:postgresql://db.internal:5432/fallback?connectTimeout=10&socketTimeout=30");
	}

	private DataSourceConfig createConfig(DataSourceType databaseType, String databaseName) {
		DataSourceConfig config = new DataSourceConfig();
		config.setDatabaseType(databaseType);
		config.setHostAddress(" db.internal ");
		config.setPort(5432);
		config.setDatabaseName(" " + databaseName + " ");
		return config;
	}
}