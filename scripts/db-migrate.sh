#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE=${COMPOSE_FILE:-docker-compose.dev.yml}

if [ -z "${DATABASE_URL-}" ]; then
  echo "DATABASE_URL not set. Using default postgres service in compose."
fi

echo "Running migrations"
run_sql() {
  local sqlfile="$1"
  if command -v psql >/dev/null 2>&1; then
    if [ -n "${DATABASE_URL-}" ]; then
      echo "-> Running $sqlfile against $DATABASE_URL"
      psql "$DATABASE_URL" -f "$sqlfile"
    else
      echo "-> psql found but DATABASE_URL not set; attempting to run against default container"
      docker compose -f "$COMPOSE_FILE" exec -T postgres psql -U gdlp -d gdlp_dev -f - < "$sqlfile"
    fi
  else
    echo "-> psql not found: streaming $sqlfile into postgres container"
    docker compose -f "$COMPOSE_FILE" exec -T postgres psql -U gdlp -d gdlp_dev -f - < "$sqlfile"
  fi
}

run_sql scripts/000_supabase_compat.sql
run_sql scripts/001_create_tables.sql
run_sql scripts/002_create_profile_trigger.sql
run_sql scripts/006_create_audit_logs.sql
run_sql scripts/007_create_analytics_functions.sql

echo "Migrations completed"
