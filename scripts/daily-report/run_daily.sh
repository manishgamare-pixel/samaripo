#!/usr/bin/env bash
# Samar's IPO Market - daily report wrapper (VPS / cron)
# Loads .env and runs the report in morning or peak mode.
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "ERROR: .env not found. Copy config.example.env to .env and fill in your keys." >&2
  exit 1
fi

set -a
source .env
set +a

MODE="${1:-morning}"

if [ "$MODE" = "peak" ]; then
  python3 daily_report.py --peak --live
else
  python3 daily_report.py --update-data
  python3 daily_report.py
fi
