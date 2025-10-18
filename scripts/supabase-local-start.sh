#!/usr/bin/env bash
set -euo pipefail

echo "This script starts the Supabase local stack via the Supabase CLI."
echo "Requires: supabase CLI installed on host (https://supabase.com/docs/guides/cli)."

if ! command -v supabase >/dev/null 2>&1; then
  echo "supabase CLI not found. Please install it (npm i -g supabase or brew install supabase/tap/supabase)"
  exit 1
fi

echo "Starting Supabase local..."
supabase start &

echo "Waiting for Supabase Postgres to be ready..."
until supabase status | grep -q "postgres.*running"; do
  sleep 1
done

echo "Supabase local stack should be running. You can now run: ./scripts/init-local.sh"
