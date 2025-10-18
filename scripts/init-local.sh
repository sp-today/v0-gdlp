#!/usr/bin/env bash
set -euo pipefail

# Quick local init: start compose, run migrations, seed DB, verify
ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

echo "Starting dev compose..."
if [ -x ./scripts/build-gotrue.sh ]; then
  echo "Building gotrue local image (if not present)..."
  ./scripts/build-gotrue.sh || echo "Warning: gotrue build failed or skipped"
fi

docker compose -f docker-compose.dev.yml up -d --build

echo "Waiting for postgres to accept connections..."
until docker compose -f docker-compose.dev.yml exec -T postgres pg_isready -U gdlp >/dev/null 2>&1; do
  sleep 1
done

export DATABASE_URL="postgresql://gdlp:gdlp_pass@localhost:5432/gdlp_dev"

echo "Running migrations..."
./scripts/db-migrate.sh

echo "Running seeds..."
./scripts/db-seed.sh

echo "Verifying via /api/db-test"
sleep 2
curl --fail http://localhost:3000/api/db-test || { echo "API test failed"; exit 1; }

echo "Local init completed."
