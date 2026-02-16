#!/bin/bash
# Cross-platform helpers for port and process operations.
# Sourced by other scripts — not executed directly.
# Supports: macOS, Linux, Windows (Git Bash / MSYS2 / Cygwin / WSL)

# Detect platform once
_UNAME="$(uname -s)"

# Find PID(s) listening on a given port.
# Usage: get_port_pids <port>
# Outputs one PID per line, or nothing if port is free.
get_port_pids() {
    local port="$1"
    case "$_UNAME" in
        MINGW*|MSYS*|CYGWIN*)
            # Windows: netstat -ano is always available
            netstat -ano 2>/dev/null \
                | grep ":${port} " \
                | grep "LISTENING" \
                | awk '{print $5}' \
                | sort -un
            ;;
        *)
            # macOS / Linux
            lsof -ti :"$port" 2>/dev/null
            ;;
    esac
}

# Kill process(es) by PID (graceful).
# Usage: kill_pids <pid> [pid...]
kill_pids() {
    case "$_UNAME" in
        MINGW*|MSYS*|CYGWIN*)
            for pid in "$@"; do
                taskkill //F //PID "$pid" >/dev/null 2>&1
            done
            ;;
        *)
            kill "$@" 2>/dev/null
            ;;
    esac
}

# Force-kill process(es) by PID.
# Usage: force_kill_pids <pid> [pid...]
force_kill_pids() {
    case "$_UNAME" in
        MINGW*|MSYS*|CYGWIN*)
            for pid in "$@"; do
                taskkill //F //PID "$pid" >/dev/null 2>&1
            done
            ;;
        *)
            kill -9 "$@" 2>/dev/null
            ;;
    esac
}
