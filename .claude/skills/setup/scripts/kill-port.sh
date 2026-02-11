#!/bin/bash
# Kill process on a given port
# Usage: kill-port.sh <port>

PORT="$1"

if [ -z "$PORT" ]; then
    echo "error=no_port_provided"
    exit 0
fi

PID=$(lsof -ti :"$PORT" 2>/dev/null)
if [ -n "$PID" ]; then
    kill $PID 2>/dev/null
    sleep 1
    # Force kill if still running
    REMAINING=$(lsof -ti :"$PORT" 2>/dev/null)
    if [ -n "$REMAINING" ]; then
        kill -9 $REMAINING 2>/dev/null
    fi
    echo "killed_pid=$PID"
    echo "status=killed"
else
    echo "status=no_process_found"
fi
