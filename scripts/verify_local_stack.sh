#!/usr/bin/env bash
set -euo pipefail

# Verify Postgres connectivity and run a simple SQL test.
# Requires docker and the local compose stack running.

CONTAINER_NAME=${PG_CONTAINER_NAME:-gdlp-local-db}
PG_USER=${POSTGRES_USER:-gdlp}
PG_DB=${POSTGRES_DB:-gdlp_dev}

echo "Verifying container: $CONTAINER_NAME"
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "Container ${CONTAINER_NAME} is not running. Start stack with: docker compose -f docker-compose.local.yml up -d"
  exit 2
fi

echo "Creating test schema and table (if not exists) and inserting a row..."
docker exec -i ${CONTAINER_NAME} psql -U ${PG_USER} -d ${PG_DB} <<'SQL'
CREATE SCHEMA IF NOT EXISTS local_test;
CREATE TABLE IF NOT EXISTS local_test.health_check (
  id serial PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);
INSERT INTO local_test.health_check (name) VALUES ('ok') ON CONFLICT DO NOTHING;
SELECT id, name, created_at FROM local_test.health_check ORDER BY id DESC LIMIT 5;
\q
SQL

echo "Done. If you see rows above the stack is working."
