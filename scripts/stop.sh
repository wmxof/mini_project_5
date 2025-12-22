#!/usr/bin/env bash
set -euo pipefail

APP_NAME="miniproject4-next"
PORT=3000
LOG="/home/ubuntu/apps/miniproject4-next/stop.log"

echo "===== STOP $(date) =====" >> "$LOG"

PID="$(lsof -ti :${PORT} || true)"

if [ -z "${PID}" ]; then
  echo "No process listening on port ${PORT}." >> "$LOG"
else
  echo "Killing PID ${PID} on port ${PORT}" >> "$LOG"
  kill -TERM "${PID}" || true
  sleep 2
  if lsof -ti :${PORT} >/dev/null 2>&1; then
    echo "Still alive, kill -KILL ${PID}" >> "$LOG"
    kill -KILL "${PID}" || true
  fi
fi

echo "===== STOP END $(date) =====" >> "$LOG"