#!/bin/bash
# Phase 1: Verify AMPECO tenant domain connectivity
# Usage: verify-domain.sh <domain>
# Sanitizes input (strips protocol/trailing slash) and checks JWKS endpoint

DOMAIN="$1"

if [ -z "$DOMAIN" ]; then
    echo "error=no_domain_provided"
    exit 0
fi

# Sanitize: strip protocol and trailing slashes (pure bash — portable across macOS, Linux, Windows Git Bash/WSL)
DOMAIN="${DOMAIN#https://}"
DOMAIN="${DOMAIN#http://}"
while [[ "$DOMAIN" == */ ]]; do
    DOMAIN="${DOMAIN%/}"
done
echo "sanitized_domain=$DOMAIN"

# Verify JWKS endpoint (-k skips SSL verification for dev environments)
HTTP_CODE=$(curl -sk -o /dev/null -w "%{http_code}" "https://${DOMAIN}/.well-known/jwks.json" 2>/dev/null)
echo "http_status=$HTTP_CODE"
