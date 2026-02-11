#!/bin/bash
# Kill process on a given port
# Usage: kill-port.sh <port>

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/_platform.sh"

PORT="$1"

if [ -z "$PORT" ]; then
    echo "error=no_port_provided"
    exit 0
fi

PIDS=$(get_port_pids "$PORT")
if [ -n "$PIDS" ]; then
    # shellcheck disable=SC2086
    kill_pids $PIDS
    sleep 1
    # Force kill if still running
    REMAINING=$(get_port_pids "$PORT")
    if [ -n "$REMAINING" ]; then
        # shellcheck disable=SC2086
        force_kill_pids $REMAINING
    fi
    echo "killed_pid=$PIDS"
    echo "status=killed"
else
    echo "status=no_process_found"
fi
