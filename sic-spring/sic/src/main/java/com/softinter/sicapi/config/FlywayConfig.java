package com.softinter.sicapi.config;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.output.MigrateResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class FlywayConfig {

    private static final Logger log = LoggerFactory.getLogger(FlywayConfig.class);

    @Bean
    public Flyway flyway(DataSource dataSource) {
        log.info("🚀 Starting automatic Flyway database migration...");
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .baselineOnMigrate(true)
                .baselineVersion("0")
                .schemas("public")
                .table("flyway_schema_history")
                .load();
        try {
            flyway.repair();
        } catch (Exception e) {
            log.warn("⚠️ Flyway repair encountered an issue: {}", e.getMessage());
        }

        try {
            MigrateResult result = flyway.migrate();
            String currentVersion = (flyway.info().current() != null && flyway.info().current().getVersion() != null)
                    ? flyway.info().current().getVersion().getVersion()
                    : "latest";
            log.info("==================================================================");
            log.info("✅ Database Connected & Flyway Migration SUCCESS!");
            log.info("   - Migrations Applied : {}", result.migrationsExecuted);
            log.info("   - Current DB Version : {}", currentVersion);
            log.info("==================================================================");
        } catch (Exception e) {
            log.error("❌ Database migration failed: {}", e.getMessage(), e);
            throw e;
        }

        return flyway;
    }
}
