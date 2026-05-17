#!/bin/bash
# Backup on demand for bot_testing.
# Intended for Dashboard Maestro testing only.

set -euo pipefail

TESTING_DIR="${TESTING_DIR:-/home/forma/bot_testing}"
BACKUP_DIR="${BACKUP_DIR:-/home/forma/backups-testing}"
KEEP_DAYS="${KEEP_DAYS:-30}"
DATE="$(date +%Y%m%d-%H%M%S)"
ARCHIVE_NAME="bot_testing-${DATE}.tar.gz"

if [[ "$TESTING_DIR" == *"/bot_dolce"* ]]; then
  echo "Refusing to run against production path: $TESTING_DIR" >&2
  exit 1
fi

if [[ ! -d "$TESTING_DIR" ]]; then
  echo "Testing directory not found: $TESTING_DIR" >&2
  exit 1
fi

if [[ ! -f "$TESTING_DIR/config/agents.json" ]]; then
  echo "agents.json not found under testing directory: $TESTING_DIR" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

includes=()
for path in \
  "data" \
  "logs" \
  "config/agents.json" \
  "config/agents.override.json" \
  ".wwebjs_auth" \
  ".wwebjs_auth_testing" \
  ".wwebjs_cache" \
  ".wwebjs_cache_testing"
do
  if [[ -e "$TESTING_DIR/$path" ]]; then
    includes+=("$path")
  fi
done

if [[ ${#includes[@]} -eq 0 ]]; then
  echo "No backup inputs found under $TESTING_DIR" >&2
  exit 1
fi

echo "Creating testing backup: $BACKUP_DIR/$ARCHIVE_NAME"
(
  cd "$TESTING_DIR"
  tar -czf "$BACKUP_DIR/$ARCHIVE_NAME" "${includes[@]}"
)

find "$BACKUP_DIR" -name "bot_testing-*.tar.gz" -mtime +"$KEEP_DAYS" -delete

echo "Backup completed: $BACKUP_DIR/$ARCHIVE_NAME"
