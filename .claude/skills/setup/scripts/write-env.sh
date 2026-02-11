#!/bin/bash
# Write .env file with provided values
# Usage: write-env.sh <domain> <api_token>
# Outputs: result=created or result=updated

DOMAIN="$1"
API_TOKEN="$2"

if [ -z "$DOMAIN" ] || [ -z "$API_TOKEN" ]; then
    echo "error=missing_arguments"
    echo "usage: write-env.sh <domain> <api_token>"
    exit 1
fi

if [ -f ".env" ]; then
    ACTION="updated"
else
    ACTION="created"
fi

cat > .env <<EOF
AMPECO_BASE_DOMAIN=${DOMAIN}
AMPECO_API_TOKEN=${API_TOKEN}
NODE_ENV=development
EOF

echo "result=${ACTION}"
