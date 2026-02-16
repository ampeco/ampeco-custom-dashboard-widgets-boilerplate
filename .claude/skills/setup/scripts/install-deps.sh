#!/bin/bash
# Phase 2a: Install dependencies
# Usage: install-deps.sh [--legacy-peer-deps]

LEGACY_FLAG=""
if [ "$1" = "--legacy-peer-deps" ]; then
    LEGACY_FLAG="--legacy-peer-deps"
fi

npm install $LEGACY_FLAG 2>&1
INSTALL_EXIT=$?
echo ""
echo "install_exit_code=$INSTALL_EXIT"

# Verify @ampeco/ampeco-ui is installed
if [ -f "node_modules/@ampeco/ampeco-ui/package.json" ]; then
    echo "ampeco_ui=installed"
else
    echo "ampeco_ui=not_found"
fi
