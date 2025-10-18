#!/bin/bash
set -e

# Create extensions and schemas
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
    CREATE SCHEMA IF NOT EXISTS audit;
EOSQL

# Create audit function
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
CREATE OR REPLACE FUNCTION audit.audit_table() RETURNS TRIGGER AS \$\$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit.logged_actions (
            schema_name,
            table_name,
            user_name,
            action,
            original_data,
            query
        ) VALUES (
            TG_TABLE_SCHEMA::TEXT,
            TG_TABLE_NAME::TEXT,
            session_user::TEXT,
            TG_OP::TEXT,
            to_jsonb(OLD.*),
            current_query()
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit.logged_actions (
            schema_name,
            table_name,
            user_name,
            action,
            original_data,
            new_data,
            query
        ) VALUES (
            TG_TABLE_SCHEMA::TEXT,
            TG_TABLE_NAME::TEXT,
            session_user::TEXT,
            TG_OP::TEXT,
            to_jsonb(OLD.*),
            to_jsonb(NEW.*),
            current_query()
        );
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit.logged_actions (
            schema_name,
            table_name,
            user_name,
            action,
            new_data,
            query
        ) VALUES (
            TG_TABLE_SCHEMA::TEXT,
            TG_TABLE_NAME::TEXT,
            session_user::TEXT,
            TG_OP::TEXT,
            to_jsonb(NEW.*),
            current_query()
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
\$\$ LANGUAGE plpgsql;
EOSQL

# Create audit table
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
CREATE TABLE IF NOT EXISTS audit.logged_actions (
    id BIGSERIAL PRIMARY KEY,
    schema_name TEXT NOT NULL,
    table_name TEXT NOT NULL,
    user_name TEXT,
    action TEXT NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
    original_data JSONB,
    new_data JSONB,
    query TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS logged_actions_table_action_idx 
ON audit.logged_actions(table_name, action);

CREATE INDEX IF NOT EXISTS logged_actions_created_at_idx 
ON audit.logged_actions(created_at);
EOSQL