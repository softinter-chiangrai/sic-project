DO
$$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_catalog.pg_roles
        WHERE rolname = 'sic-auth'
    ) THEN
        CREATE ROLE "sic-auth" LOGIN;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_catalog.pg_roles
        WHERE rolname = 'sic-app'
    ) THEN
        CREATE ROLE "sic-app" LOGIN;
    END IF;
END
$$;

ALTER ROLE "sic-auth" WITH LOGIN PASSWORD 'SicAuth2026';
ALTER ROLE "sic-app" WITH LOGIN PASSWORD 'SicApp2026';

SELECT 'CREATE DATABASE sic_auth OWNER "sic-auth"'
WHERE NOT EXISTS (
    SELECT 1
    FROM pg_database
    WHERE datname = 'sic_auth'
)\gexec

SELECT 'CREATE DATABASE sic_app OWNER "sic-app"'
WHERE NOT EXISTS (
    SELECT 1
    FROM pg_database
    WHERE datname = 'sic_app'
)\gexec

GRANT ALL PRIVILEGES ON DATABASE sic_auth TO "sic-auth";
GRANT ALL PRIVILEGES ON DATABASE sic_app TO "sic-app";

\connect sic_auth

GRANT USAGE, CREATE ON SCHEMA public TO "sic-auth";
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "sic-auth";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "sic-auth";
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON TABLES TO "sic-auth";
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON SEQUENCES TO "sic-auth";

\connect sic_app

GRANT USAGE, CREATE ON SCHEMA public TO "sic-app";
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "sic-app";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "sic-app";
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON TABLES TO "sic-app";
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON SEQUENCES TO "sic-app";
