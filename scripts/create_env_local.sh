#!/usr/bin/env bash
# Create a local .env file from .env.example without committing secrets
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
EXAMPLE="$ROOT_DIR/.env.example"
LOCAL="$ROOT_DIR/.env.local"

if [ ! -f "$EXAMPLE" ]; then
  echo ".env.example not found"
  exit 1
fi

if [ -f "$LOCAL" ]; then
  echo ".env.local already exists. Edit it directly to add your secrets."
  exit 0
fi

cp "$EXAMPLE" "$LOCAL"
chmod 600 "$LOCAL" || true
echo "Created .env.local from .env.example — fill in real values and do not commit .env.local"
