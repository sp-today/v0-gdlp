#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE=${COMPOSE_FILE:-docker-compose.dev.yml}

echo "Running seed scripts"
run_sql() {
  local sqlfile="$1"
  if command -v psql >/dev/null 2>&1; then
    if [ -n "${DATABASE_URL-}" ]; then
      echo "-> Running $sqlfile against $DATABASE_URL"
      psql "$DATABASE_URL" -f "$sqlfile"
    else
      echo "-> psql found but DATABASE_URL not set; streaming to postgres container"
      docker compose -f "$COMPOSE_FILE" exec -T postgres psql -U gdlp -d gdlp_dev -f - < "$sqlfile"
    fi
  else
    echo "-> psql not found: streaming $sqlfile into postgres container"
    docker compose -f "$COMPOSE_FILE" exec -T postgres psql -U gdlp -d gdlp_dev -f - < "$sqlfile"
  fi
}

run_sql scripts/003_seed_repair_guides.sql
run_sql scripts/004_seed_spare_parts.sql
run_sql scripts/005_seed_repair_centers.sql

echo "Seeding completed"
