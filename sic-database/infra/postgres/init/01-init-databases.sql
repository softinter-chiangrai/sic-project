-- Initialization script for PostgreSQL
-- Creates roles and databases for Keycloak (sic-auth) and Spring Boot Backend (sic-app)

-- 1. Create Roles if not exists
DO
$do$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'sic-auth') THEN
      CREATE USER "sic-auth" WITH ENCRYPTED PASSWORD 'SicAuth2026';
   END IF;
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'sic-app') THEN
      CREATE USER "sic-app" WITH ENCRYPTED PASSWORD 'SicApp2026';
   END IF;
END
$do$;

-- 2. Create Databases if not exists
SELECT 'CREATE DATABASE sic_auth OWNER "sic-auth"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'sic_auth')\gexec

SELECT 'CREATE DATABASE sic_app OWNER "sic-app"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'sic_app')\gexec

-- 3. Grant Permissions
GRANT ALL PRIVILEGES ON DATABASE sic_auth TO "sic-auth";
GRANT ALL PRIVILEGES ON DATABASE sic_app TO "sic-app";
