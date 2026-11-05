#!/usr/bin/env bash
# Deploys this folder's code straight to the server, without Git: packs the working tree as it is on disk
# (no node_modules, build output, .git, local settings or data), streams it over SSH, and `ti receive`
# builds it and switches to it. The live site stays as it is if the build or the health check fails.
# Usage (from code/web):  npm run deploy -- "what changed"
# Server: TI_HOST (default ti-vps, the SSH alias for root@165.245.163.217).
set -euo pipefail
cd "$(dirname "$0")/.."
HOST=${TI_HOST:-ti-vps}
NOTE=${1:-"$(date '+%Y-%m-%d %H:%M') from $(hostname)"}

echo "Packing $(pwd)…" >&2
tar -czf - \
  --exclude=./node_modules --exclude=./.next --exclude=./.git --exclude=./.data --exclude=./logs \
  --exclude='./.env' --exclude='./.env.*' --exclude=./tsconfig.tsbuildinfo --exclude='./*.log' --exclude=./test-results --exclude=./playwright-report \
  . | ssh "$HOST" "ti receive $(printf '%q' "$NOTE")"
ssh "$HOST" ti status
