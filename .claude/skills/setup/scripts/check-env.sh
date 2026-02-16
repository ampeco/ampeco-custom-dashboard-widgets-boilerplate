#!/bin/bash
# Phase 0: Environment Detection
# Outputs structured key=value pairs for the setup wizard to parse

# Node.js
NODE_VERSION=$(node --version 2>/dev/null || echo "not_found")
echo "node_version=$NODE_VERSION"

# npm
NPM_VERSION=$(npm --version 2>/dev/null || echo "not_found")
echo "npm_version=$NPM_VERSION"

# .env file
if [ -f ".env" ]; then
    echo "env_file=exists"
    if grep -q "^AMPECO_BASE_DOMAIN=" .env 2>/dev/null; then
        echo "env_AMPECO_BASE_DOMAIN=set"
    else
        echo "env_AMPECO_BASE_DOMAIN=not_set"
    fi
    if grep -q "^AMPECO_API_TOKEN=" .env 2>/dev/null; then
        echo "env_AMPECO_API_TOKEN=set"
    else
        echo "env_AMPECO_API_TOKEN=not_set"
    fi
else
    echo "env_file=not_found"
fi

# node_modules
if [ -d "node_modules" ]; then
    echo "node_modules=exists"
    if [ -f "node_modules/@ampeco/ampeco-ui/package.json" ]; then
        echo "ampeco_ui=installed"
    else
        echo "ampeco_ui=not_found"
    fi
else
    echo "node_modules=not_found"
    echo "ampeco_ui=not_found"
fi
