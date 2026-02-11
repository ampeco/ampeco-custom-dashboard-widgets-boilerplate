#!/bin/bash
# Phase 2b: Verify dev server starts and responds to health checks
# Usage: verify-dev-server.sh [port]
# Default port: 3000
# If the port is in use, reports the PID and exits (does NOT kill it).

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/_platform.sh"

PORT="${1:-3000}"
echo "port=$PORT"

# Check if port is in use
EXISTING_PID=$(get_port_pids "$PORT" | head -1)
if [ -n "$EXISTING_PID" ]; then
    echo "port_status=in_use"
    echo "port_pid=$EXISTING_PID"
    exit 0
fi

echo "port_status=free"

# Start dev server in background
DEV_LOG=$(mktemp)
if [ "$PORT" = "3000" ]; then
    npm run dev > "$DEV_LOG" 2>&1 &
else
    npm run dev -- --port "$PORT" > "$DEV_LOG" 2>&1 &
fi
DEV_PID=$!

# Wait for server to start (up to 30 seconds)
MAX_WAIT=30
WAITED=0
HEALTH_OK=false

while [ $WAITED -lt $MAX_WAIT ]; do
    sleep 2
    WAITED=$((WAITED + 2))
    RESPONSE=$(curl -s "http://localhost:${PORT}/api/health" 2>/dev/null)
    if echo "$RESPONSE" | grep -q '"status":"ok"'; then
        HEALTH_OK=true
        echo "health_check=ok"
        echo "health_response=$RESPONSE"
        break
    fi
done

if [ "$HEALTH_OK" = false ]; then
    echo "health_check=failed"
    echo "waited_seconds=$WAITED"
    echo "--- dev server log ---"
    cat "$DEV_LOG"
    echo "--- end log ---"
fi

# Stop the dev server
PORT_PIDS=$(get_port_pids "$PORT")
if [ -n "$PORT_PIDS" ]; then
    # shellcheck disable=SC2086
    kill_pids $PORT_PIDS
    sleep 1
fi

# Verify it's stopped
REMAINING=$(get_port_pids "$PORT")
if [ -n "$REMAINING" ]; then
    # shellcheck disable=SC2086
    force_kill_pids $REMAINING
fi

echo "server_stopped=true"
rm -f "$DEV_LOG"
