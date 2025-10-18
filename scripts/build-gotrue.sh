#!/usr/bin/env bash
set -euo pipefail

ROOT=$(cd "$(dirname "$0")/.." && pwd)
SRC_DIR="$ROOT/dev/gotrue/src"
IMAGE_NAME="v0-gdlp-gotrue:local"

echo "Build gotrue local image: $IMAGE_NAME"

if [ -d "$SRC_DIR" ]; then
  echo "Using existing source at $SRC_DIR"
  cd "$SRC_DIR"
  git pull --rebase || true
else
  echo "Cloning gotrue repo into $SRC_DIR"
  mkdir -p "$ROOT/dev/gotrue"
  git clone https://github.com/supabase/gotrue.git "$SRC_DIR"
  cd "$SRC_DIR"
fi

if ! command -v go >/dev/null 2>&1; then
  echo "Go toolchain not found. Please install Go to build gotrue locally."
  exit 1
fi

echo "Building gotrue binary (this may take a while)..."
make build

echo "Building docker image $IMAGE_NAME"
docker build -t "$IMAGE_NAME" .

echo "Built $IMAGE_NAME"
