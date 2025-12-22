#!/usr/bin/env bash
set -euo pipefail

APP_NAME="miniproject4-next"
APP_DIR="/home/ubuntu/apps/miniproject4-next"
PORT=3000
LOG="$APP_DIR/start.log"
PID_FILE="$APP_DIR/app.pid"
REV_FILE="/home/ubuntu/apps/REVISION.txt"   # buildspec에서 만들어주면 여기서 찍힘

mkdir -p "$APP_DIR"
touch "$LOG"

{
  echo "===== START $(date -u) ====="
  echo "APP_DIR=$APP_DIR PORT=$PORT"

  # --- nvm 환경(있다면) 로드: CodeDeploy 훅에서 node 못 찾는 문제 방지 ---
  export NVM_DIR="$HOME/.nvm"
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    # shellcheck disable=SC1090
    . "$NVM_DIR/nvm.sh"
    nvm use 20 >/dev/null 2>&1 || true
  fi

  # --- PATH 보강(일부 환경에서 /usr/local/bin 누락되는 경우 대비) ---
  export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"

  echo "PWD(before cd): $(pwd)"
  cd "$APP_DIR"
  echo "PWD: $(pwd)"

  # node/npm이 없으면 여기서 바로 원인이 드러나게 로그 남기고 종료
  if ! command -v node >/dev/null 2>&1; then
    echo "ERROR: node not found in PATH=$PATH"
    exit 1
  fi
  if ! command -v npm >/dev/null 2>&1; then
    echo "ERROR: npm not found in PATH=$PATH"
    exit 1
  fi

  echo "Node: $(node -v)"
  echo "NPM : $(npm -v)"

  # (있으면) 배포 리비전 찍기
  if [ -f "$REV_FILE" ]; then
    echo "--- REVISION.txt ---"
    cat "$REV_FILE"
    echo "--------------------"
  fi

  # --- 기존 프로세스 정리: PID + 포트 둘 다 사용 ---
  # 1) PID 파일 기준
  if [ -f "$PID_FILE" ]; then
    OLD_PID="$(cat "$PID_FILE" || true)"
    if [ -n "${OLD_PID}" ] && ps -p "$OLD_PID" >/dev/null 2>&1; then
      echo "Stopping old PID from pidfile: $OLD_PID"
      kill -TERM "$OLD_PID" || true
      sleep 2
    fi
    rm -f "$PID_FILE"
  fi

  # 2) 포트 기준(좀 더 확실)
  PORT_PID="$(lsof -ti :${PORT} 2>/dev/null | head -n 1 || true)"
  if [ -n "${PORT_PID}" ]; then
    echo "Port ${PORT} still in use by PID=${PORT_PID}. Killing..."
    kill -TERM "$PORT_PID" || true
    sleep 2
    if lsof -ti :${PORT} >/dev/null 2>&1; then
      echo "Still in use. kill -KILL ${PORT_PID}"
      kill -KILL "$PORT_PID" || true
    fi
  fi

  # --- 의존성 설치 ---
  # 아티팩트에 node_modules가 없으니 EC2에서 설치하는 구조가 맞음.
  # Next가 devDependencies에 들어있는 경우 --omit=dev 하면 next가 없어져서 실패함.
  # => production 설치를 원칙으로 하되, next가 dependencies에 있는지 보장해야 함.
  if [ ! -d node_modules ] || [ ! -x node_modules/.bin/next ]; then
    echo "Installing dependencies (npm ci)..."
    rm -rf node_modules
    # 안정적으로 production만 설치
    NODE_ENV=production npm ci --omit=dev
  fi

  # --- 빌드 산출물 확인(배포가 제대로 됐는지 빠르게 감지) ---
  if [ ! -d ".next" ]; then
    echo "ERROR: .next directory not found. Deployment artifact may be wrong."
    exit 1
  fi

  echo "Starting Next.js on port ${PORT}..."
  # npx 대신 로컬 바이너리 직접 실행 (재현성↑)
  nohup ./node_modules/.bin/next start -p "$PORT" >> "$LOG" 2>&1 &
  NEW_PID=$!
  echo "$NEW_PID" > "$PID_FILE"
  echo "Next.js started with PID $NEW_PID"

  # --- 헬스체크(바로 실패하는 경우 로그로 잡기) ---
  sleep 2
  if lsof -ti :${PORT} >/dev/null 2>&1; then
    echo "Healthcheck: port ${PORT} LISTEN OK"
  else
    echo "ERROR: port ${PORT} not listening after start. Check log."
    exit 1
  fi

  echo "===== END $(date -u) ====="
} >> "$LOG" 2>&1
